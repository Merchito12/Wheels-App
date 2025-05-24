import React, { useState, useEffect } from "react";
import { 
  View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator 
} from "react-native";
import { Searchbar } from "react-native-paper";
import { Ionicons } from '@expo/vector-icons';  // <-- Importa Ionicons aquí
import colors from "../../styles/Colors"; 
import { SortIcon, FilterIcon } from "../../components/Icons"; 
import { useCliente } from "../../context/viajeContext/viajeClienteContext"; 

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viajesPorIniciar, setViajesPorIniciar] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { obtenerViajesPorEstado } = useCliente();

  const onChangeSearch = (query: string) => setSearchQuery(query);

  useEffect(() => {
    async function cargarViajes() {
      setLoading(true);
      try {
        const viajes = await obtenerViajesPorEstado("por iniciar");
        setViajesPorIniciar(viajes);
      } catch (error) {
        console.error("Error cargando viajes:", error);
      } finally {
        setLoading(false);
      }
    }
    cargarViajes();
  }, []);

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Buscar viaje..."
        value={searchQuery}
        onChangeText={onChangeSearch}
        style={styles.barraBusqueda}
      />
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.sort}>
          <SortIcon color={colors.grey} /> <Text style={styles.buttonText}>Sort</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.filter}>       
          <FilterIcon color={colors.grey} /> <Text style={styles.buttonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.headerContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.headerTitle}>Viaje en Curso</Text>
          <Text style={styles.headerSubtitle}>
            {viajesPorIniciar.length > 0
              ? `${viajesPorIniciar[0].fecha}, ${viajesPorIniciar[0].horaSalida}, ${viajesPorIniciar[0].direccion}`
              : "No hay viajes por iniciar"}
          </Text>
          <TouchableOpacity style={styles.detailsButton}>
            <Text style={styles.detailsButtonText}>Ver detalles</Text>
          </TouchableOpacity>
        </View>
        <Image
          source={require("../../assets/images/carImage.png")} 
          style={styles.carImage}
        />
      </View>

      {/* Viajes disponibles */}
      <ScrollView showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        <View style={styles.tripsContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.blue} />
          ) : viajesPorIniciar.length === 0 ? (
            <Text>No hay viajes por iniciar</Text>
          ) : (
            viajesPorIniciar.map((viaje, index) => (
              <View key={viaje.id} style={styles.tripCard}>
                <Image
                  source={require("../../assets/images/carImage.png")}
                  style={styles.image}
                />
                <Text style={styles.tripName}>
                  {viaje.direccion} {/* Dirección del viaje */}
                </Text>
                <Text style={styles.conductorName}>Conductor: {viaje.conductor || "Desconocido"}</Text>
                <Text style={styles.tripPrice}>€ {viaje.precio}</Text>

                {/* Aquí están los iconos antes de fecha y hora */}
                <View style={styles.row}>
                  <Ionicons name="calendar-outline" size={16} color={colors.grey} />
                  <Text style={styles.dateText}> {viaje.fecha}</Text>
                </View>
                <View style={styles.row}>
                  <Ionicons name="time-outline" size={16} color={colors.grey} />
                  <Text style={styles.dateText}> {viaje.horaSalida}</Text>
                </View>

                <TouchableOpacity style={styles.reserveButton}>
                  <Text style={styles.reserveButtonText}>Reservar</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 30,
    paddingTop: 40,
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
    width: 100,
    height: 100,
    resizeMode: "contain",
    borderRadius: 10,
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 14,
    color: colors.black,
  },
});
