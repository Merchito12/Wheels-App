import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Searchbar } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../styles/Colors";
import { FilterIcon } from "../../components/Icons";
import { useCliente } from "../../context/viajeContext/viajeClienteContext";
import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../utils/FirebaseConfig";

import ModalReservaViaje from "../../components/modales/ModalReservaViaje";
import ModalFiltro from "../../components/modales/ModalFiltro";
import { useAuth } from "../../context/authContext/AuthContext";
import { router } from "expo-router";

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viajesPorIniciar, setViajesPorIniciar] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [viajeSeleccionado, setViajeSeleccionado] = useState<any>(null);
  const [conductorInfo, setConductorInfo] = useState<any>(null);
  const [cargandoConductor, setCargandoConductor] = useState(false);

  const { obtenerViajesPorEstadoViajeYEstadoPunto } = useCliente();

  const { user, userName } = useAuth();
  const [viajeEnCurso, setViajeEnCurso] = useState<any>(null);

  // Modal filtro
  const [modalFiltroVisible, setModalFiltroVisible] = useState(false);
  const [filters, setFilters] = useState<{
    tipoViaje: "desde" | "hacia" | "";
    fechaFiltro: "hoy" | "mañana" | "personalizado" | "";
    fechaPersonalizada?: Date | null;
    precioMin?: number | null;
    precioMax?: number | null;
  }>({
    tipoViaje: "",
    fechaFiltro: "",
    fechaPersonalizada: null,
    precioMin: null,
    precioMax: null,
  });

  const onChangeSearch = (query: string) => setSearchQuery(query);

  // Carga viaje en curso con listener
  useEffect(() => {
    if (!user) return;

    setLoading(true);

    const viajesRef = collection(db, "viajes");
    const q = query(viajesRef, where("estado", "==", "en curso"));

    const unsubscribe = onSnapshot(
      q,
      async (querySnapshot) => {
        let viajeEncontrado: any = null;

        for (const docSnap of querySnapshot.docs) {
          const data = docSnap.data();
          const puntos = data.puntos || [];

          const puntoAceptado = puntos.find(
            (p: any) => p.estado === "aceptado" && p.idCliente === user.uid
          );

          if (puntoAceptado) {
            viajeEncontrado = { id: docSnap.id, ...data };

            if (viajeEncontrado.idConductor && !viajeEncontrado.conductorCarPhoto) {
              const docRef = doc(db, "users", viajeEncontrado.idConductor);
              const docSnapUser = await getDoc(docRef);
              if (docSnapUser.exists()) {
                const conductorData = docSnapUser.data();
                viajeEncontrado.conductorCarPhoto = conductorData.car?.photoURL || null;
              }
            }
            break;
          }
        }

        setViajeEnCurso(viajeEncontrado);
        setLoading(false);
      },
      (error) => {
        console.error("Error en onSnapshot viajes en curso:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Carga viajes por iniciar con listener
  useEffect(() => {
    if (!user) return;
  
    setLoading(true);
  
    const viajesRef = collection(db, "viajes");
    const q = query(viajesRef, where("estado", "==", "por iniciar"));
  
    const obtenerFotoPerfilConductor = async (uid: string): Promise<string | null> => {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          return data.profilePhotoURL || null;
        }
      } catch (error) {
        console.error(`Error obteniendo foto de perfil del conductor ${uid}:`, error);
      }
      return null;
    };
  
    const unsubscribe = onSnapshot(
      q,
      async (querySnapshot) => {
        try {
          const viajesDocs = querySnapshot.docs;
  
          const viajesConductor = await Promise.all(
            viajesDocs.map(async (docSnap) => {
              const viaje: { id: string; idConductor?: string; [key: string]: any } = { id: docSnap.id, ...docSnap.data() };
  
              if (viaje.idConductor) {
                const docRef = doc(db, "users", viaje.idConductor);
                const docSnapUser = await getDoc(docRef);
                if (docSnapUser.exists()) {
                  const conductorData = docSnapUser.data();
  
                  // Usar tu función para obtener la foto perfil
                  const perfilPhotoURL = await obtenerFotoPerfilConductor(viaje.idConductor);
  
                  return {
                    ...viaje,
                    conductorNombre: conductorData.name || "Sin nombre",
                    conductorProfilePhoto: perfilPhotoURL,
                    conductorCarPhoto: conductorData.car?.photoURL || null,
                  };
                }
              }
              return {
                ...viaje,
                conductorNombre: "Sin conductor",
                conductorProfilePhoto: null,
                conductorCarPhoto: null,
              };
            })
          );
  
          setViajesPorIniciar(viajesConductor);
        } catch (error) {
          console.error("Error procesando viajes por iniciar:", error);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error escuchando viajes por iniciar:", error);
        setLoading(false);
      }
    );
  
    return () => unsubscribe();
  }, [user]);
  

  async function obtenerConductorPorId(idConductor: string) {
    setCargandoConductor(true);
    try {
      const docRef = doc(db, "users", idConductor);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error obteniendo conductor:", error);
      return null;
    } finally {
      setCargandoConductor(false);
    }
  }

  const abrirModal = async (viaje: any) => {
    setViajeSeleccionado(viaje);
    setModalVisible(true);

    if (viaje.idConductor) {
      const conductor = await obtenerConductorPorId(viaje.idConductor);
      setConductorInfo(conductor);
    } else {
      setConductorInfo(null);
    }
  };

  // Función para convertir DD/MM/YYYY a Date
  const parseFechaDDMMYYYY = (fechaStr: string): Date | null => {
    const partes = fechaStr.split("/");
    if (partes.length !== 3) return null;

    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const anio = parseInt(partes[2], 10);

    const fecha = new Date(anio, mes, dia);
    return isNaN(fecha.getTime()) ? null : fecha;
  };

  const mismaFechaSinHora = (fecha1: Date, fecha2: Date) => {
    return (
      fecha1.getFullYear() === fecha2.getFullYear() &&
      fecha1.getMonth() === fecha2.getMonth() &&
      fecha1.getDate() === fecha2.getDate()
    );
  };

  const viajesFiltrados = viajesPorIniciar.filter((viaje) => {
    const texto = searchQuery.toLowerCase();
    const direccion = viaje.direccion?.toLowerCase() || "";
    if (texto && !direccion.includes(texto)) return false;

    // Filtro tipoViaje con boolean haciaLaU
    if (filters.tipoViaje === "hacia" && viaje.haciaLaU !== true) return false;
    if (filters.tipoViaje === "desde" && viaje.haciaLaU !== false) return false;

    // FILTRO FECHA con formato DD/MM/YYYY
    if (filters.fechaFiltro) {
      const hoy = new Date();
      const manana = new Date();
      manana.setDate(hoy.getDate() + 1);

      if (!viaje.fecha) return false;
      const fechaViaje = parseFechaDDMMYYYY(viaje.fecha);
      if (!fechaViaje) return false;

      if (filters.fechaFiltro === "hoy") {
        if (!mismaFechaSinHora(fechaViaje, hoy)) return false;
      } else if (filters.fechaFiltro === "mañana") {
        if (!mismaFechaSinHora(fechaViaje, manana)) return false;
      } else if (filters.fechaFiltro === "personalizado") {
        if (filters.fechaPersonalizada) {
          if (!mismaFechaSinHora(fechaViaje, filters.fechaPersonalizada)) return false;
        }
      }
    }

    // FILTRO PRECIO (string con punto o coma decimal -> number)
    const precioString = viaje.precio || "";
    const precioViaje = Number(precioString.replace(",", "."));
    if (isNaN(precioViaje)) return false;

    if (filters.precioMin != null && precioViaje < filters.precioMin) return false;
    if (filters.precioMax != null && precioViaje > filters.precioMax) return false;

    return true;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.greetingText}>
        Hola, {userName ? userName.charAt(0).toUpperCase() + userName.slice(1) : ""}
      </Text>
      <Searchbar
        placeholder="Buscar viaje..."
        value={searchQuery}
        onChangeText={onChangeSearch}
        style={styles.barraBusqueda}
      />

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.filter} onPress={() => setModalFiltroVisible(true)}>
          <FilterIcon color={colors.grey} />
          <Text style={styles.buttonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {viajeEnCurso ? (
          <View style={styles.headerContainer}>
            <View style={styles.textContainer}>
              <Text style={styles.headerTitle}>{viajeEnCurso.direccion}</Text>
              <Text style={styles.headerSubtitle}>{` ${viajeEnCurso.horaSalida} hr`}</Text>
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => router.push("../detallesViaje/EnCursoUsuario")}
              >
                <Text style={styles.detailsButtonText}>Ver detalles</Text>
              </TouchableOpacity>
            </View>
            <Image
              source={
                viajeEnCurso.conductorCarPhoto
                  ? { uri: viajeEnCurso.conductorCarPhoto }
                  : require("../../assets/images/carImage.png")
              }
              style={styles.carImage}
            />
          </View>
        ) : null}

        <View style={styles.tripsContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.blue} />
          ) : viajesFiltrados.length === 0 ? (
            <Text>No hay viajes que coincidan con los filtros</Text>
          ) : (
            viajesFiltrados.map((viaje) => (
              <View key={viaje.id} style={styles.tripCard}>
                {viaje.conductorCarPhoto ? (
                  <Image source={{ uri: viaje.conductorCarPhoto }} style={styles.image} />
                ) : (
                  <Image source={require("../../assets/images/carImage.png")} style={styles.image} />
                )}
            
                <Text>
                  <Text style={{ fontWeight: "bold" }}>
                    {viaje.haciaLaU ? "Desde:" : "Hacia:"}{" "}
                  </Text>
                  <Text style={styles.tripName}>{viaje.direccion}</Text>
                </Text>
            
                <View style={styles.conductorContainer}>
                  {viaje.conductorProfilePhoto && (
                    <Image source={{ uri: viaje.conductorProfilePhoto }} style={styles.conductorImage} />
                  )}
                  <Text style={styles.conductorName}>{viaje.conductorNombre}</Text>
                </View>
            
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="cash-outline" size={16} color={colors.grey} />
                <Text style={[styles.tripPrice, { marginLeft: 4 }]}>COP {viaje.precio}</Text>
              </View>
            
                <View style={styles.row}>
                  <Ionicons name="calendar-outline" size={16} color={colors.grey} />
                  <Text style={styles.dateText}> {viaje.fecha}</Text>
                </View>
                <View style={styles.row}>
                  <Ionicons name="time-outline" size={16} color={colors.grey} />
                  <Text style={styles.dateText}> {viaje.horaSalida}</Text>
                </View>
            
                <TouchableOpacity style={styles.reserveButton} onPress={() => abrirModal(viaje)}>
                  <Text style={styles.reserveButtonText}>Reservar</Text>
                </TouchableOpacity>
              </View>
            ))
            
          )}
        </View>
      </ScrollView>

      <ModalFiltro
        visible={modalFiltroVisible}
        onClose={() => setModalFiltroVisible(false)}
        onApplyFilters={(nuevosFiltros) => setFilters(nuevosFiltros)}
      />

      <ModalReservaViaje
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setViajeSeleccionado(null);
          setConductorInfo(null);
        }}
        viajeSeleccionado={viajeSeleccionado}
        conductorInfo={conductorInfo}
        cargandoConductor={cargandoConductor}
        onAceptar={() => {
          setModalVisible(false);
          alert("¡Punto Solicitado!");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 30,
    paddingTop: 80,
  },
  barraBusqueda: {
    marginBottom: 20,
    backgroundColor: colors.lightGrey,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  headerContainer: {
    backgroundColor: colors.blue,
    padding: 20,
    paddingRight: 0,
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.white,
    marginBottom: 20,
  },
  carImage: {
    width: 150,
    height: 150,
    resizeMode: "contain",
  },
  detailsButton: {
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    width: 110,
  },
  detailsButtonText: {
    color: colors.blue,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  filter: {
    backgroundColor: colors.lightBlue,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    marginLeft: 10,
    color: colors.black,
    fontSize: 16,
  },
  tripsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  tripCard: {
    backgroundColor: colors.lightGrey,
    width: "48%",
    marginBottom: 15,
    borderRadius: 10,
    padding: 10,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.lightGrey,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  
  image: {
    width: "100%",
    height: 100,
    resizeMode: "contain",
    borderRadius: 5,
    marginBottom: 10,
  },
  tripName: {
    fontSize: 16,
    marginBottom: 5,
  },
  conductorName: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 8,
    fontWeight: "500",
  },
  tripPrice: {
    fontSize: 14,
  },
  reserveButton: {
    backgroundColor: colors.blue,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 5,
    alignItems: "center",
  },
  reserveButtonText: {
    color: colors.white,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  dateText: {
    fontSize: 14,
    color: colors.black,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.black,
    marginBottom: 20,
    marginTop: 30,
  },
  conductorContainer: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 25,
  },
  
  conductorImage: {
    width: 22,
    height: 22,
    borderRadius: 16, // círculo
    marginRight: 8,
  },
  
});
