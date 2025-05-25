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
import { useAuth } from "@/context/authContext/AuthContext"; // importa tu contexto auth
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/utils/FirebaseConfig";



interface PuntoConViaje {
  viaje: Viaje;
  punto: Punto;
}

export default function Solicitudes() {
  const [activeTab, setActiveTab] = useState<EstadoPunto | "todos">("todos");
  const [puntosMostrar, setPuntosMostrar] = useState<PuntoConViaje[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth(); // usuario logueado


  const {
    obtenerViajesPorEstadoPunto,
  } = useCliente();

  useEffect(() => {
    if (!user) return;
  
    setLoading(true);
    const viajesRef = collection(db, "viajes");
  
    // Listener para todos los viajes
    const unsubscribe = onSnapshot(viajesRef, (querySnapshot) => {
      const resultados: PuntoConViaje[] = [];
  
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as Viaje;
  
        // Filtrar puntos según el tab activo y usuario
        let puntosFiltrados: Punto[] = [];
  
        if (activeTab === "todos") {
          puntosFiltrados = data.puntos.filter((p) => p.idCliente === user.uid);
        } else {
          puntosFiltrados = data.puntos.filter(
            (p) => p.idCliente === user.uid && p.estado === activeTab
          );
        }
  
        puntosFiltrados.forEach((punto) => {
          resultados.push({
            viaje: { id: docSnap.id, ...((({ id, ...rest }) => rest)(data)) },
            punto,
          });
        });
      });
  
      setPuntosMostrar(resultados);
      setLoading(false);
    }, (error) => {
      console.error("Error escuchando viajes en tiempo real:", error);
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, [activeTab, user]);

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
