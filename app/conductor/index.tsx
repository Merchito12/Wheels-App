import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { router } from "expo-router";
import { Searchbar } from "react-native-paper";
import { useAuth } from "../../context/authContext/AuthContext";
import { useViajes } from "../../context/viajeContext/ViajeConductorContext";
import colors from "../../styles/Colors";
import { Ionicons } from '@expo/vector-icons';
import { EstadoPunto } from "@/context/viajeContext/viajeClienteContext";
import { useViajeSeleccionado } from '../../context/viajeContext/ViajeSeleccionadoContext';
import { useRegisterPushNotifications } from "../hooks/useRegisterPushNotifications";



interface Punto {
  direccion: string;
  estado: string;
  idCliente: string; // Added idCliente property
  // agrega más campos si tienes
}

interface Viaje {
  id: string;
  conductor: string;
  haciaLaU: boolean;
  direccion: string;
  horaSalida: string;
  fecha: string;
  precio: string;
  puntos: Punto[]; // ojo, puntos es arreglo de objetos Punto
  estado: string;
}

export default function Viajes() {
  useRegisterPushNotifications(); // Register push notifications
  const { userName, user } = useAuth();
  const { viajes, obtenerPuntosPorEstado,
    actualizarEstadoPunto,  obtenerPuntosPorEstadoYEstadoViaje  } = useViajes();

  const [searchQuery, setSearchQuery] = useState("");
  const [viajesEnCurso, setViajesEnCurso] = useState<Viaje[]>([]);
  const [loadingEnCurso, setLoadingEnCurso] = useState(false);
  const [puntosPendientes, setPuntosPendientes] = useState<
    { viajeId: string; viajeDireccion: string; punto: Punto }[]
  >([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [accionPendiente, setAccionPendiente] = useState<{
    viajeId: string;
    idCliente: string;
    nuevoEstado: EstadoPunto;
  } | null>(null);
  const { setViaje } = useViajeSeleccionado();


  const onChangeSearch = (query: string) => setSearchQuery(query);

  // Filtrar viajes en curso desde viajes del contexto
  useEffect(() => {
    if (!user) return;
    setLoadingEnCurso(true);
    const filtrados = viajes.filter((v) => v.estado === "en curso");
    setViajesEnCurso(filtrados);
    setLoadingEnCurso(false);
  }, [viajes, user]);

  // Obtener puntos pendientes
  useEffect(() => {
    async function fetchPendientesPorIniciar() {
      if (!user?.uid) return;
      const puntos = await obtenerPuntosPorEstadoYEstadoViaje("pendiente", "por iniciar");
      setPuntosPendientes(puntos);
    }
    fetchPendientesPorIniciar();
  }, [user]);

  // Filtrar viajes por búsqueda (origen o destino)
  const viajesFiltrados = viajes.filter((viaje) => {
    const textoBusqueda = searchQuery.toLowerCase();
    return (
      viaje.direccion.toLowerCase().includes(textoBusqueda) ||
      (viaje.conductor && viaje.conductor.toLowerCase().includes(textoBusqueda))
    );
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greetingText}>
        Hola, {userName ? userName.charAt(0).toUpperCase() + userName.slice(1) : ""}
      </Text>

      <Searchbar
        placeholder="Buscar viaje..."
        value={searchQuery}
        onChangeText={onChangeSearch}
        style={styles.barraBusqueda}
      />

      {viajesEnCurso.length > 0 && (
  <View style={styles.headerContainer}>
    <View style={styles.headerTextContainer}>
      <Text style={styles.headerTitle}>Viaje en Curso</Text>
      <Text style={styles.headerSubtitle}>
        {viajesEnCurso[0].fecha}, {viajesEnCurso[0].horaSalida}, {viajesEnCurso[0].direccion}
      </Text>
      <TouchableOpacity onPress={() => router.push('../detallesViaje/conductor/EnCurso')}>
        <Text style={styles.verDetalles}>Ver detalles</Text>
      </TouchableOpacity>
    </View>
    <Image
      source={require("../../assets/images/carImage.png")}
      style={styles.headerImage}
    />
  </View>
)}

      {/* Tus viajes */}
      <View style={styles.section}>
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>Tus viajes</Text>
    <TouchableOpacity>
      <Text style={styles.verMas}>Ver más</Text>
    </TouchableOpacity>
  </View>

  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    {viajesFiltrados.length > 0 ? (
      viajesFiltrados.map((viaje, index) => (
        <View key={viaje.id} style={styles.viajeCard}>
          <View style={styles.fechaTag}>
            <Text style={styles.fechaText}>{viaje.fecha}</Text>
          </View>

          <View style={styles.cardImage} />

          <Text style={styles.viajeCiudad}>{viaje.direccion}</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Ionicons name="time-outline" size={14} color="#555" />
            <Text style={styles.viajeDesc}>{"  "}{viaje.horaSalida} h</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            <Ionicons name="cash-outline" size={14} color="#555" />
            <Text style={styles.viajeDesc}>{"  "}${viaje.precio}</Text>
          </View>

          <Text style={styles.viajeSolicitudes}>{viaje.estado}</Text>

          <TouchableOpacity
            style={styles.verInfoButton}
            onPress={() => {
              setViaje(viaje);
              router.push('/detallesViaje/conductor/PorIniciar');
            }}
          >
            <Text style={styles.verInfoText}>Ver info</Text>
          </TouchableOpacity>

        </View>
      ))
    ) : (
      <Text style={styles.noViajesText}>No tienes viajes creados aún.</Text>
    )}
  </ScrollView>
</View>


      {/* Puntos Solicitados */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Puntos Solicitados</Text>
        {puntosPendientes.map(({ viajeId, viajeDireccion, punto }, index) => (
          <View key={`${viajeId}-${index}`} style={styles.puntoCard}>
            <View style={styles.puntoImagen} />
            <View style={{ flex: 1 }}>
              <Text style={styles.puntoTitulo}>
                Punto {index + 1} - Viaje: {viajeDireccion}
              </Text>
              <Text style={styles.puntoDireccion}>{punto.direccion}</Text>
              <Text style={styles.puntoDireccion}>Estado: {punto.estado}</Text>
            </View>

            <View style={styles.puntoBotones}>
              <TouchableOpacity
                style={styles.btnNegar}
                onPress={async () => {
                  try {
                    await actualizarEstadoPunto(viajeId, punto.idCliente, "negado");
                    const puntosActualizados = await obtenerPuntosPorEstado("pendiente");
                    setPuntosPendientes(puntosActualizados);
                  } catch (err) {
                    console.error("Error al negar punto:", err);
                  }
                }}
              >
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnAceptar}
                onPress={async () => {
                  try {
                    await actualizarEstadoPunto(viajeId, punto.idCliente, "aceptado");
                    const puntosActualizados = await obtenerPuntosPorEstado("pendiente");
                    setPuntosPendientes(puntosActualizados);
                  } catch (err) {
                    console.error("Error al aceptar punto:", err);
                  }
                }}
              >
                <Ionicons name="checkmark" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

      </View>

      {/* Botón "Crear Viaje" */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push("/conductor/miViaje")}
      >
        <Text style={styles.createButtonText}>Crear Viaje</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 80,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.black,
    marginBottom: 20,
    marginTop: 40,
  },
  barraBusqueda: {
    marginBottom: 20,
    backgroundColor: colors.lightGrey,
  },
  headerContainer: {
    backgroundColor: colors.blue,
    borderRadius: 12,
    flexDirection: "row",
    padding: 16,
    marginBottom: 24,
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    color: colors.white,
    fontSize: 13,
    marginBottom: 8,
  },
  verDetalles: {
    color: colors.white,
    textDecorationLine: "underline",
    fontSize: 13,
  },
  headerImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  verMas: {
    color: colors.blue,
    fontSize: 14,
  },
  viajeCard: {
    width: 200,
    backgroundColor: colors.lightGrey,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    position: "relative",
  },
  fechaTag: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.blue,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 3,
  },
  fechaText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.white,
  },
  cardImage: {
    width: "100%",
    height: 60,
    backgroundColor: colors.lightGrey100,
    borderRadius: 8,
    marginBottom: 10,
  },
  viajeCiudad: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  viajeDesc: {
    fontSize: 12,
    color: colors.grey,
    marginBottom: 2,
  },
  viajeSolicitudes: {
    fontSize: 12,
    color: colors.grey,
    marginBottom: 10,
  },
  verInfoButton: {
    borderColor: colors.blue,
    borderWidth: 1,
    borderRadius: 20,
    alignItems: "center",
    paddingVertical: 6,
  },
  verInfoText: {
    color: colors.blue,
    fontWeight: "bold",
    fontSize: 13,
  },
  noViajesText: {
    fontSize: 16,
    color: colors.grey,
    textAlign: "center",
    padding: 20,
  },
  puntoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGrey,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  puntoImagen: {
    width: 40,
    height: 40,
    backgroundColor: colors.lightGrey100,
    borderRadius: 8,
    marginRight: 12,
  },
  puntoTitulo: {
    fontWeight: "bold",
    fontSize: 15,
  },
  puntoDireccion: {
    fontSize: 13,
    color: colors.grey,
  },
  createButton: {
    backgroundColor: colors.blue,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  puntoBotones: {
    flexDirection: "row",
    marginLeft: 10,
    alignItems: "center",
    gap: 8,
  },
  btnNegar: {
    backgroundColor: "#e74c3c",
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  btnAceptar: {
    backgroundColor: "#2ecc71",
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  
});
