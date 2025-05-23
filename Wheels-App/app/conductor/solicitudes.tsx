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

interface Punto {
  estado: string;
  fecha?: string;
  hora?: string;
  direccion?: string;
  sector?: string;
  // otros campos si tienes
}

interface Viaje {
  id: string;
  direccion: string;
  fecha: string;
  horaSalida: string;
  // otros campos si tienes
}

interface PuntoConViaje {
  viaje: Viaje;  // aquí guardamos el viaje completo
  punto: Punto;
}

export default function Solicitudes() {
  const [activeTab, setActiveTab] = useState<
    "todos" | "aceptados" | "pendientes" | "negados"
  >("todos");
  const [puntosPendientes, setPuntosPendientes] = useState<PuntoConViaje[]>([]);
  const [puntosAceptados, setPuntosAceptados] = useState<PuntoConViaje[]>([]);
  const [puntosNegados, setPuntosNegados] = useState<PuntoConViaje[]>([]);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { solicitudesDePuntos, solicitudesDePuntosPorEstado } = useViajes();

  // Carga pendientes
  useEffect(() => {
    async function fetchPendientes() {
      if (!user?.uid) return;
      setLoading(true);
      try {
        // Aunque traemos puntos filtrados, necesitamos el viaje completo para mostrar datos
        const todos = await solicitudesDePuntos();
        const filtrados = todos.filter(({ punto }) => punto.estado === "pendiente");
        setPuntosPendientes(
          filtrados.map(({ viaje, punto }) => ({
            viaje,
            punto,
          }))
        );
      } catch (error) {
        console.error("Error al obtener puntos pendientes:", error);
      } finally {
        setLoading(false);
      }
    }
    if (activeTab === "pendientes" || activeTab === "todos") fetchPendientes();
  }, [user, solicitudesDePuntos, solicitudesDePuntosPorEstado, activeTab]);

  // Carga aceptados
  useEffect(() => {
    async function fetchAceptados() {
      if (!user?.uid) return;
      setLoading(true);
      try {
        const todos = await solicitudesDePuntos();
        const filtrados = todos.filter(({ punto }) => punto.estado === "aceptado");
        setPuntosAceptados(
          filtrados.map(({ viaje, punto }) => ({
            viaje,
            punto,
          }))
        );
      } catch (error) {
        console.error("Error al obtener puntos aceptados:", error);
      } finally {
        setLoading(false);
      }
    }
    if (activeTab === "aceptados" || activeTab === "todos") fetchAceptados();
  }, [user, solicitudesDePuntos, activeTab]);

  // Carga negados
  useEffect(() => {
    async function fetchNegados() {
      if (!user?.uid) return;
      setLoading(true);
      try {
        const todos = await solicitudesDePuntos();
        const filtrados = todos.filter(({ punto }) => punto.estado === "negado");
        setPuntosNegados(
          filtrados.map(({ viaje, punto }) => ({
            viaje,
            punto,
          }))
        );
      } catch (error) {
        console.error("Error al obtener puntos negados:", error);
      } finally {
        setLoading(false);
      }
    }
    if (activeTab === "negados" || activeTab === "todos") fetchNegados();
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
      <View key={`${viaje.id}-${index}`} style={styles.solicitudCard}>
        <View style={styles.solicitudInfo}>
          <Text style={styles.solicitudTitle}>Viaje: {viaje.direccion}</Text>
          <Text style={styles.solicitudPrice}>Estado: {punto.estado}</Text>
          <Text style={styles.solicitudDetails}>Fecha: {viaje.fecha || "N/A"}</Text>
          <Text style={styles.solicitudDetails}>Hora: {viaje.horaSalida || "N/A"}</Text>
          <Text style={styles.solicitudDetails}>Dirección del punto: {punto.direccion || "N/A"}</Text>
          <Text style={styles.solicitudDetails}>Sector: {punto.sector || "N/A"}</Text>
        </View>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Solicitudes</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 55 }}
      >
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
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: "600",
    color: "#000",
    marginBottom: 20,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#EAEAEA",
    borderRadius: 20,
    marginHorizontal: 3,
  },
  activeTab: {
    backgroundColor: "#007BFF",
  },
  tabText: {
    color: colors.white,
    fontWeight: "600",
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
  solicitudesList: {
    paddingBottom: 100,
  },
});
