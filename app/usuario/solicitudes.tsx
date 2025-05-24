import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import colors from "@/styles/Colors";
import { useCliente } from "../../context/viajeContext/viajeClienteContext";

interface Punto {
  estado: string;
  fecha?: string;
  hora?: string;
  direccion?: string;
  sector?: string;
}

interface Viaje {
  id: string;
  direccion: string;
  fecha: string;
  horaSalida: string;
  puntos: Punto[];
}

interface PuntoConViaje {
  viaje: Viaje;
  punto: Punto;
}

export default function Solicitudes() {
  const [activeTab, setActiveTab] = useState<
    "todos" | "aceptados" | "pendientes" | "negados"
  >("todos");
  const [puntos, setPuntos] = useState<PuntoConViaje[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    obtenerViajesPorEstado,
    obtenerViajesPorEstadoPunto,
  } = useCliente();

  // Mapeo para convertir "aceptados" -> "aceptado", etc.
  const estadoPuntoMap: Record<string, string> = {
    aceptados: "aceptado",
    pendientes: "pendiente",
    negados: "negado",
  };

  useEffect(() => {
    async function cargarPuntos() {
      setLoading(true);
      try {
        if (activeTab === "todos") {
          // Traer todos los viajes con estado "por iniciar"
          const viajes = await obtenerViajesPorEstado("por iniciar");
          const todosPuntos: PuntoConViaje[] = [];
          viajes.forEach((viaje) => {
            viaje.puntos?.forEach((punto) => {
              todosPuntos.push({ viaje, punto });
            });
          });
          setPuntos(todosPuntos);
        } else {
          // Filtrar viajes con estado "por iniciar" y puntos con estado específico
          const viajes = await obtenerViajesPorEstado("por iniciar");
          const puntosFiltrados: PuntoConViaje[] = [];
          viajes.forEach((viaje) => {
            viaje.puntos
              ?.filter((p) => p.estado === estadoPuntoMap[activeTab])
              .forEach((punto) => puntosFiltrados.push({ viaje, punto }));
          });
          setPuntos(puntosFiltrados);
        }
      } catch (error) {
        console.error("Error cargando puntos:", error);
        setPuntos([]);
      } finally {
        setLoading(false);
      }
    }
    cargarPuntos();
  }, [activeTab, obtenerViajesPorEstado]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.blue} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Solicitudes</Text>

      {/* Tabs para filtrar por estado */}
      <View style={styles.tabs}>
        {["todos", "aceptados", "pendientes", "negados"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab ? styles.activeTab : null]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={styles.tabText}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.solicitudesList}>
        {puntos.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20, color: "#999" }}>
            No hay solicitudes para mostrar
          </Text>
        ) : (
          puntos.map(({ viaje, punto }, index) => (
            <View key={`${viaje.id}-${index}`} style={styles.solicitudCard}>
              <View style={styles.solicitudInfo}>
                <Text style={styles.solicitudTitle}>Viaje: {viaje.direccion}</Text>
                <Text style={styles.solicitudPrice}>Estado del viaje: por iniciar</Text>
                <Text style={styles.solicitudDetails}>Estado del punto: {punto.estado}</Text>
                <Text style={styles.solicitudDetails}>Fecha: {viaje.fecha || "N/A"}</Text>
                <Text style={styles.solicitudDetails}>Hora: {viaje.horaSalida || "N/A"}</Text>
                <Text style={styles.solicitudDetails}>Dirección del punto: {punto.direccion || "N/A"}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 20,
    color: "#000",
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#EAEAEA",
    marginHorizontal: 3,
  },
  activeTab: {
    backgroundColor: "#007BFF",
  },
  tabText: {
    color: "#fff",
    fontWeight: "600",
  },
  solicitudesList: {
    paddingBottom: 100,
  },
  solicitudCard: {
    backgroundColor: "#F0F8FF",
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
  },
  solicitudInfo: {
    paddingBottom: 10,
  },
  solicitudTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  solicitudPrice: {
    fontSize: 14,
    marginBottom: 5,
  },
  solicitudDetails: {
    fontSize: 12,
    marginBottom: 5,
    color: "#007BFF",
  },
});
