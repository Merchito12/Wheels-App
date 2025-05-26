import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "@/context/authContext/AuthContext";
import { useViajes } from "../../context/viajeContext/ViajeConductorContext";
import colors from "@/styles/Colors";
import { Ionicons } from "@expo/vector-icons";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/utils/FirebaseConfig";


interface Punto {
  estado: string;
  fecha?: string;
  hora?: string;
  direccion?: string;
  sector?: string;
  idCliente?: string;
}

interface Viaje {
  id: string;
  direccion: string;
  fecha: string;
  horaSalida: string;
}

interface PuntoConViaje {
  viaje: Viaje;
  punto: Punto;
}

export default function Solicitudes() {
  const [activeTab, setActiveTab] = useState<"todos" | "aceptados" | "pendientes" | "negados">("todos");
  const [puntosPendientes, setPuntosPendientes] = useState<PuntoConViaje[]>([]);
  const [puntosAceptados, setPuntosAceptados] = useState<PuntoConViaje[]>([]);
  const [puntosNegados, setPuntosNegados] = useState<PuntoConViaje[]>([]);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { solicitudesDePuntos, actualizarEstadoPunto, obtenerPuntosPorEstado } = useViajes();

  useEffect(() => {
    async function fetchData() {
      if (!user?.uid) return;
      setLoading(true);
      try {
        const todos = await solicitudesDePuntos();
        if (activeTab === "pendientes" || activeTab === "todos") {
          const filtrados = todos.filter(({ punto }) => punto.estado === "pendiente");
          setPuntosPendientes(filtrados);
        }
        if (activeTab === "aceptados" || activeTab === "todos") {
          const filtrados = todos.filter(({ punto }) => punto.estado === "aceptado");
          setPuntosAceptados(filtrados);
        }
        if (activeTab === "negados" || activeTab === "todos") {
          const filtrados = todos.filter(({ punto }) => punto.estado === "negado");
          setPuntosNegados(filtrados);
        }
      } catch (error) {
        console.error("Error al obtener solicitudes:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user, solicitudesDePuntos, activeTab]);

  const renderSolicitudes = () => {
    let puntosMostrar: PuntoConViaje[] = [];
    if (activeTab === "todos") {
      puntosMostrar = [...puntosPendientes, ...puntosAceptados, ...puntosNegados];
    } else if (activeTab === "aceptados") {
      puntosMostrar = puntosAceptados;
    } else if (activeTab === "pendientes") {
      puntosMostrar = puntosPendientes;
    } else if (activeTab === "negados") {
      puntosMostrar = puntosNegados;
    }

    if (loading) {
      return (
        <ActivityIndicator size="large" color={colors.blue} style={{ marginTop: 20 }} />
      );
    }

    if (puntosMostrar.length === 0) {
      return (
        <Text style={{ textAlign: "center", marginTop: 20, color: "#999" }}>
          No hay solicitudes para mostrar
        </Text>
      );
    }

    return puntosMostrar.map(({ viaje, punto }, index) => (
      <View key={`${viaje.id}-${index}`} style={styles.puntoCard}>
        <View style={styles.puntoImagen}>
          <Ionicons name="location-sharp" size={30} color="blue" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.puntoTitulo}>Viaje: {viaje.direccion}</Text>
          <Text style={styles.puntoDireccion}>Dirección Solicitada: {punto.direccion || "Sin dirección"}</Text>
          <Text style={styles.puntoDireccion}>Fecha: {viaje.fecha}</Text>
          <Text style={styles.puntoDireccion}>Hora: {viaje.horaSalida}</Text>
          <Text style={[styles.puntoDireccion, { color: colors.blue, fontWeight: "bold" }]}>
            {punto.estado.charAt(0).toUpperCase() + punto.estado.slice(1)}
          </Text>
          {punto.estado === "pendiente" && (
            <View style={styles.puntoBotones}>
              <TouchableOpacity
                style={styles.btnNegar}
                onPress={async () => {
                  try {
                    await actualizarEstadoPunto(viaje.id, punto.idCliente!, "negado");
                    const puntosActualizados = await obtenerPuntosPorEstado("pendiente");
                    setPuntosPendientes(
                      puntosActualizados.map(({ viajeId, viajeDireccion, punto }) => ({
                        viaje: { id: viajeId, direccion: viajeDireccion, fecha: "", horaSalida: "" },
                        punto,
                      }))
                    );
                  } catch (err) {
                    console.error("Error al negar punto:", err);
                  }
                }}
              >
                <Ionicons name="close" size={20} color="blue" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnAceptar}
                onPress={async () => {
                  try {
                    await actualizarEstadoPunto(viaje.id, punto.idCliente!, "aceptado");
                    const puntosActualizados = await obtenerPuntosPorEstado("pendiente");
                    setPuntosPendientes(
                      puntosActualizados.map(({ viajeId, viajeDireccion, punto }) => ({
                        viaje: { id: viajeId, direccion: viajeDireccion, fecha: "", horaSalida: "" },
                        punto,
                      }))
                    );
                  } catch (err) {
                    console.error("Error al aceptar punto:", err);
                  }
                }}
              >
                <Ionicons name="checkmark-sharp" size={24} color="blue" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Solicitudes</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 70 }}>
        <View style={styles.tabs}>
          {["todos", "aceptados", "pendientes", "negados"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ScrollView contentContainerStyle={styles.solicitudesList}>
        {renderSolicitudes()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "600",
    color: "#000",
    marginBottom: 20,
  },
  tabs: {
    flexDirection: "row",
    alignItems: "center",
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#EAEAEA",
    borderRadius: 20,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: "#007BFF",
  },
  tabText: {
    fontWeight: "600",
    fontSize: 14,
    color: "#333",
  },
  activeTabText: {
    color: colors.white,
  },
  puntoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGrey,
    borderRadius: 12,
    padding: 12,
    paddingVertical: 20,
    marginTop: 10,
  },
  puntoImagen: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  puntoTitulo: {
    fontWeight: "bold",
    fontSize: 15,
  },
  puntoDireccion: {
    fontSize: 13,
    color: colors.grey,
  },
  puntoBotones: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },
  btnNegar: {
    backgroundColor: colors.white,
    borderColor: colors.blue,
    borderWidth: 1,
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  btnAceptar: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderColor: colors.blue,
    borderWidth: 1,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  solicitudesList: {
    paddingBottom: 100,
  },
});