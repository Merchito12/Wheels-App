import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useCliente, EstadoPunto, Viaje, Punto } from "../../context/viajeContext/viajeClienteContext";
import colors from "@/styles/Colors";
import { Ionicons } from "@expo/vector-icons";

interface PuntoConViaje {
  viaje: Viaje;
  punto: Punto;
}

export default function Solicitudes() {
  const [activeTab, setActiveTab] = useState<EstadoPunto | "todos">("todos");
  const [puntosMostrar, setPuntosMostrar] = useState<PuntoConViaje[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    obtenerViajesPorEstadoPunto,
  } = useCliente();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (activeTab === "todos") {
          // Obtener viajes con puntos en cualquier estado pendiente, aceptado o negado
          const pendientes = await obtenerViajesPorEstadoPunto("pendiente");
          const aceptados = await obtenerViajesPorEstadoPunto("aceptado");
          const negados = await obtenerViajesPorEstadoPunto("negado");

          // Mapear a PuntoConViaje y unir todos
          const mapPuntos = (viajes: Viaje[], estado: EstadoPunto) =>
            viajes.flatMap((viaje) =>
              viaje.puntos
                .filter((p) => p.estado === estado)
                .map((punto) => ({ viaje, punto }))
            );

          const todosPuntos = [
            ...mapPuntos(pendientes, "pendiente"),
            ...mapPuntos(aceptados, "aceptado"),
            ...mapPuntos(negados, "negado"),
          ];

          setPuntosMostrar(todosPuntos);
        } else {
          // Obtener viajes con puntos en el estado seleccionado
          const viajes = await obtenerViajesPorEstadoPunto(activeTab as EstadoPunto);

          // Mapear a PuntoConViaje filtrando solo los puntos del estado activo
          const puntos = viajes.flatMap((viaje) =>
            viaje.puntos
              .filter((p) => p.estado === activeTab)
              .map((punto) => ({ viaje, punto }))
          );
          setPuntosMostrar(puntos);
        }
      } catch (error) {
        console.error("Error al obtener solicitudes:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [activeTab]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Solicitudes</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 70 }}>
        <View style={styles.tabs}>
          {["todos", "aceptado", "pendiente", "negado"].map((tab) => (
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
        {loading ? (
          <ActivityIndicator size="large" color={colors.blue} style={{ marginTop: 20 }} />
        ) : puntosMostrar.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20, color: "#999" }}>
            No hay solicitudes para mostrar
          </Text>
        ) : (
          puntosMostrar.map(({ viaje, punto }, index) => (
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
  solicitudesList: {
    paddingBottom: 100,
  },
});
