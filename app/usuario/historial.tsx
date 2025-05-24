import React, { useState, useEffect } from "react";
import { 
  View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator, Modal 
} from "react-native";
import { Searchbar } from "react-native-paper";
import colors from "../../styles/Colors"; 
import { StarIcon, ArrowRight } from "../../components/Icons"; 
import { useCliente } from "../../context/viajeContext/viajeClienteContext";

export default function MisViajes() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viajes, setViajes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedViaje, setSelectedViaje] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useCliente(); // o desde authContext si es necesario
  const { obtenerViajesPorEstadoViajeYEstadoPunto } = useCliente();

  const onChangeSearch = (query: string) => setSearchQuery(query);

  useEffect(() => {
    async function cargarViajes() {
      setLoading(true);
      try {
        // Obtenemos viajes finalizados con puntos aceptados
        const viajesFiltrados = await obtenerViajesPorEstadoViajeYEstadoPunto("finalizado", "aceptado");
        setViajes(viajesFiltrados);
      } catch (error) {
        console.error("Error cargando viajes:", error);
      } finally {
        setLoading(false);
      }
    }
    cargarViajes();
  }, []);

  // Función para abrir modal y mostrar detalles
  const abrirDetalles = (viaje: any) => {
    setSelectedViaje(viaje);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tus viajes finalizados</Text>

      <Searchbar
        placeholder="Buscar viaje..."
        value={searchQuery}
        onChangeText={onChangeSearch}
        style={styles.searchbar}
      />

      {loading ? (
        <ActivityIndicator size="large" color={colors.blue} />
      ) : viajes.length === 0 ? (
        <Text style={{textAlign: 'center', marginTop: 20}}>No hay viajes finalizados con puntos aceptados.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {viajes.map((viaje) => (
            <TouchableOpacity 
              key={viaje.id} 
              style={styles.tripCard} 
              onPress={() => abrirDetalles(viaje)}
            >
              <Image
                source={require("../../assets/images/carImage.png")} 
                style={styles.image}
              />
              <View style={styles.tripInfo}>
                <Text style={styles.tripDate}>{viaje.fecha}</Text>
                <Text style={styles.tripDetails}>{viaje.direccion}</Text>
                <Text style={styles.tripDetails}>Conductor: {viaje.conductor || "Desconocido"}</Text>
              </View>
              <View style={styles.starsContainer}>
                <Text style={styles.tripDetails}>5</Text>
                <StarIcon color={colors.blue} />
              </View>
              <ArrowRight  color={colors.grey} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Modal para detalles del viaje */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Detalles del viaje</Text>
            {selectedViaje ? (
              <ScrollView style={{ maxHeight: 300 }}>
                <Text style={styles.modalSubtitle}>Dirección: {selectedViaje.direccion}</Text>
                <Text style={styles.modalSubtitle}>Fecha: {selectedViaje.fecha}</Text>
                <Text style={styles.modalSubtitle}>Hora: {selectedViaje.horaSalida}</Text>
                <Text style={styles.modalSubtitle}>Conductor: {selectedViaje.conductor}</Text>

                <Text style={[styles.modalSubtitle, { marginTop: 15 }]}>Puntos Aceptados:</Text>
                {selectedViaje.puntos
                  ?.filter((p: any) => p.estado === "aceptado")
                  .map((punto: any, index: number) => (
                    <View key={index} style={styles.puntoCard}>
                      <Text>Dirección: {punto.direccion || "N/A"}</Text>
                      <Text>Estado: {punto.estado}</Text>
                    </View>
                ))}
              </ScrollView>
            ) : null}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    borderColor: colors.lightGrey,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
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
  tripDetails: {
    fontSize: 14,
    color: "#555",
    marginBottom: 2,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  puntoCard: {
    backgroundColor: colors.lightGrey,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: colors.blue,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: colors.white,
    fontWeight: "bold",
  },
});
