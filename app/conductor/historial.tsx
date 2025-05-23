import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import colors from "../../styles/Colors";
import { Searchbar } from "react-native-paper";
import { useAuth } from "../../context/authContext/AuthContext";
import { useViajes } from "@/context/viajeContext/ViajeConductorContext";

// IMPORTA TUS ICONOS AQUÍ (ajusta rutas y nombres)
import { SortIcon, StarIcon, ArrowRight } from "../../components/Icons";

export default function Viajes() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { viajes, viajesFiltradosPorEstado } = useViajes();

  const [searchQuery, setSearchQuery] = useState("");
  const [viajesFinalizados, setViajesFinalizados] = useState<typeof viajes>([]);
  const [loading, setLoading] = useState(false);

  // Recargar viajes finalizados cada vez que la pantalla gana foco
  useFocusEffect(
    useCallback(() => {
      async function fetchFinalizados() {
        if (!user) return;
        setLoading(true);
        try {
          const finalizados = await viajesFiltradosPorEstado("finalizado");
          setViajesFinalizados(finalizados);
        } catch (error) {
          console.error("Error cargando viajes finalizados:", error);
        } finally {
          setLoading(false);
        }
      }
      fetchFinalizados();
    }, [user, viajesFiltradosPorEstado])
  );

  const onChangeSearch = (query: string) => setSearchQuery(query);

  // Filtrar por búsqueda localmente (sobre los finalizados)
  const filteredViajes = viajesFinalizados.filter((viaje) =>
    viaje.direccion.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tus viajes Anteriores</Text>

      <Searchbar
        placeholder="Buscar viaje..."
        value={searchQuery}
        onChangeText={onChangeSearch}
        style={styles.searchbar}
      />

      <TouchableOpacity style={styles.sort}>
        <SortIcon color={colors.grey} />
        <Text style={styles.buttonText}>Sort</Text>
      </TouchableOpacity>

      <ScrollView
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {loading ? (
          <Text style={{ textAlign: "center", marginTop: 20, color: colors.grey }}>
            Cargando viajes...
          </Text>
        ) : filteredViajes.length > 0 ? (
          filteredViajes.map((viaje) => (
            <View key={viaje.id} style={styles.tripCard}>
              <Image
                source={require("../../assets/images/carImage.png")}
                style={styles.image}
              />
              <View style={styles.tripInfo}>
                <Text style={styles.tripDate}>{viaje.fecha}</Text>
                <Text style={styles.tripDetails}>{viaje.direccion}</Text>
              </View>
              <View style={styles.starsContainer}>
                <Text style={styles.tripDetails}>5</Text>
                <StarIcon color={colors.blue} />
              </View>
              <ArrowRight color={colors.grey} />
            </View>
          ))
        ) : (
          <Text style={styles.noViajesText}>No tienes viajes finalizados.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
    justifyContent: "space-between",
    marginRight: 50,
  },
  sort: {
    width: 100,
    backgroundColor: colors.lightBlue,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  header: {
    fontSize: 28,
    fontWeight: "600",
    color: "#000",
    marginBottom: 20,
  },
  searchbar: {
    marginBottom: 20,
    backgroundColor: colors.lightGrey,
  },
  scrollContainer: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  tripCard: {
    backgroundColor: colors.lightBlue,
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.lightGreyrows,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    marginRight: 10,
    marginLeft: 10,
  },
  image: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    borderRadius: 25,
    marginRight: 15,
  },
  tripInfo: {
    flex: 1,
  },
  tripDate: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  buttonText: {
    marginLeft: 10,
    color: colors.black,
    fontSize: 16,
  },
  tripDetails: {
    fontSize: 14,
    color: "#888",
    marginRight: 10,
  },
  noViajesText: {
    fontSize: 16,
    color: colors.grey,
    textAlign: "center",
    padding: 20,
  },
});
