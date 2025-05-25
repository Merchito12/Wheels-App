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
import { SortIcon, FilterIcon } from "../../components/Icons";
import { useCliente } from "../../context/viajeContext/viajeClienteContext";
import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../utils/FirebaseConfig";

import ModalReservaViaje from "../../components/modales/ModalReservaViaje";
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

  const { obtenerViajesPorEstado, obtenerViajesPorEstadoViajeYEstadoPunto } = useCliente();

  const { user } = useAuth();
  const { userName } = useAuth();
  const [viajeEnCurso, setViajeEnCurso] = useState<any>(null);


  const onChangeSearch = (query: string) => setSearchQuery(query);

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
  
          // ¿Tiene punto aceptado para este usuario?
          const puntoAceptado = puntos.find(
            (p: any) => p.estado === "aceptado" && p.idCliente === user.uid
          );
  
          if (puntoAceptado) {
            viajeEncontrado = { id: docSnap.id, ...data };
  
            // Obtener foto del conductor si no está ya
            if (viajeEncontrado.idConductor && !viajeEncontrado.conductorCarPhoto) {
              const docRef = doc(db, "users", viajeEncontrado.idConductor);
              const docSnapUser = await getDoc(docRef);
              if (docSnapUser.exists()) {
                const conductorData = docSnapUser.data();
                viajeEncontrado.conductorCarPhoto = conductorData.car?.photoURL || null;
              }
            }
            break; // ya encontramos el viaje, no continuar
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
  


  
  useEffect(() => {
    async function cargarViajeEnCurso() {
      if (!user) return;
      setLoading(true);
      try {
        const viajesEnCurso = await obtenerViajesPorEstadoViajeYEstadoPunto("en curso", "aceptado");
  
        // Filtra viaje con punto solicitado por el usuario y aceptado
        const viajeFiltrado = viajesEnCurso.find(viaje =>
          viaje.puntos.some(punto => punto.idCliente === user.uid && punto.estado === "aceptado")
        );
  
        if (viajeFiltrado && viajeFiltrado.idConductor) {
          const docRef = doc(db, "users", viajeFiltrado.idConductor);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const conductorData = docSnap.data();
            viajeFiltrado.conductorCarPhoto = conductorData.car?.photoURL || null;
          }
        }
  
        setViajeEnCurso(viajeFiltrado || null);
      } catch (error) {
        console.error("Error cargando viaje en curso:", error);
      } finally {
        setLoading(false);
      }
    }


    cargarViajeEnCurso();
  }, [user]);
  
  useEffect(() => {
    if (!user) return;
  
    setLoading(true);
  
    const viajesRef = collection(db, "viajes");
    const q = query(viajesRef, where("estado", "==", "por iniciar"));
  
    const unsubscribe = onSnapshot(
      q,
      async (querySnapshot) => {
        try {
          const viajesDocs = querySnapshot.docs;
  
          // Para cada viaje, obtenemos info del conductor y armamos el objeto completo
          const viajesConductor = await Promise.all(
            viajesDocs.map(async (docSnap) => {
              const viaje: { id: string; idConductor?: string; [key: string]: any } = { id: docSnap.id, ...docSnap.data() };
  
              if (viaje.idConductor) {
                const docRef = doc(db, "users", viaje.idConductor);
                const docSnapUser = await getDoc(docRef);
                if (docSnapUser.exists()) {
                  const conductorData = docSnapUser.data();
                  return {
                    ...viaje,
                    conductorNombre: conductorData.name || "Sin nombre",
                    conductorCarPhoto: conductorData.car?.photoURL || null,
                  };
                }
              }
              return {
                ...viaje,
                conductorNombre: "Sin conductor",
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
       

        <TouchableOpacity style={styles.filter}>
          <FilterIcon color={colors.grey} />{" "}
          <Text style={styles.buttonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      



      <ScrollView
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >

{viajeEnCurso ? (
      <View style={styles.headerContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.headerTitle}>{viajeEnCurso.direccion}</Text>
          <Text style={styles.headerSubtitle}>
            {` ${viajeEnCurso.horaSalida} hr`}
          </Text>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => router.push('../detallesViaje/EnCursoUsuario')}
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
          ) : viajesPorIniciar.length === 0 ? (
            <Text>No hay viajes por iniciar</Text>
          ) : (
            viajesPorIniciar.map((viaje) => (
              <View key={viaje.id} style={styles.tripCard}>
                {/* Foto del carro del conductor */}
                {viaje.conductorCarPhoto ? (
                  <Image
                    source={{ uri: viaje.conductorCarPhoto }}
                    style={styles.image}
                  />
                ) : (
                  <Image
                    source={require("../../assets/images/carImage.png")}
                    style={styles.image}
                  />
                )}

                {/* Nombre del conductor */}
                <Text style={styles.conductorName}>{viaje.conductorNombre}</Text>

                {/* Dirección */}
                <Text style={styles.tripName}>{viaje.direccion}</Text>

                {/* Precio */}
                <Text style={styles.tripPrice}>€ {viaje.precio}</Text>

                <View style={styles.row}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={colors.grey}
                  />
                  <Text style={styles.dateText}> {viaje.fecha}</Text>
                </View>
                <View style={styles.row}>
                  <Ionicons name="time-outline" size={16} color={colors.grey} />
                  <Text style={styles.dateText}> {viaje.horaSalida}</Text>
                </View>

                <TouchableOpacity
                  style={styles.reserveButton}
                  onPress={() => abrirModal(viaje)}
                >
                  <Text style={styles.reserveButtonText}>Reservar</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

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
          alert("¡Viaje reservado!");
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
  sort: {
    backgroundColor: colors.lightBlue,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
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
    alignItems: "center",
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
    fontWeight: "600",
    marginBottom: 5,
  },
  conductorName: {
    fontSize: 14,
    color: colors.darkGrey,
    marginBottom: 8,
    fontWeight: "600",
    textAlign: "center",
  },
  tripPrice: {
    fontSize: 14,
    marginBottom: 15,
  },
  reserveButton: {
    backgroundColor: colors.blue,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 5,
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
});
