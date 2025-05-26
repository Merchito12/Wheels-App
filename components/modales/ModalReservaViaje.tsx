import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Modal,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../styles/Colors";
import { useCliente } from "../../context/viajeContext/viajeClienteContext"; // Ajusta ruta si es necesario
import AutocompleteLugar from "../shared/Autocomplete";
import MapComponent from "../shared/Map";

interface ModalReservaViajeProps {
  visible: boolean;
  onClose: () => void;
  viajeSeleccionado: any | null;
  conductorInfo: any | null;
  cargandoConductor: boolean;
  onAceptar: () => void;
}

export default function ModalReservaViaje({
  visible,
  onClose,
  viajeSeleccionado,
  conductorInfo,
  cargandoConductor,
  onAceptar,
}: ModalReservaViajeProps) {
  const { crearPuntoEnViaje } = useCliente();
  const [sugerencia, setSugerencia] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleAceptar = async () => {
    if (!sugerencia.trim()) {
      Alert.alert("Validación", "Por favor ingresa una sugerencia antes de aceptar.");
      return;
    }
    if (!viajeSeleccionado) {
      Alert.alert("Error", "No hay viaje seleccionado.");
      return;
    }
    setEnviando(true);
    try {
      await crearPuntoEnViaje(viajeSeleccionado.id, {
        direccion: sugerencia.trim(),
        estado: "pendiente",
        idCliente: "", // El contexto asigna idCliente automáticamente
      });
      setSugerencia("");
      onAceptar(); // Cierra modal o realiza acción extra
    } catch (error) {
      Alert.alert("Error", "No se pudo enviar la sugerencia.");
      console.error(error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={onClose} disabled={enviando}>
              <Ionicons name="close" size={28} color={colors.black} />
            </TouchableOpacity>

            {viajeSeleccionado ? (
              <>
                <View style={styles.profileSection}>
                  {conductorInfo?.profilePhotoURL ? (
                    <Image
                      source={{ uri: conductorInfo.profilePhotoURL }}
                      style={styles.profilePhoto}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={[
                        styles.profilePhoto,
                        { backgroundColor: "#ccc", justifyContent: "center", alignItems: "center" },
                      ]}
                    >
                      <Text>No hay foto</Text>
                    </View>
                  )}
                </View>

                <View style={styles.nameSection}>
                  <Text style={styles.nameText}>{conductorInfo?.name || "No disponible"}</Text>
                  
                </View>

                <View style={styles.rowInfoContainer}>
                  <View style={styles.seatsContainer}>
                    <View style={styles.row}>
                      <Ionicons name="calendar-outline" size={25} color={colors.grey} />
                      <Text style={styles.dateText}> {viajeSeleccionado.fecha}</Text>
                    </View>
                    <View style={styles.row}>
                      <Ionicons name="time-outline" size={25} color={colors.grey} />
                      <Text style={styles.dateText}> {viajeSeleccionado.horaSalida}</Text>
                    </View>
                    <Text style={styles.availableSeats}>
                      {viajeSeleccionado.cuposDisponibles} cupo
                      {(conductorInfo?.car?.seats ?? 1) > 1 ? "s" : ""} disponible
                      {(conductorInfo?.car?.seats ?? 1) > 1 ? "s" : ""}
                    </Text>
                  </View>

                  <View style={styles.carInfoBox}>
                    {conductorInfo?.car?.photoURL ? (
                      <Image
                        source={{ uri: conductorInfo.car.photoURL }}
                        style={styles.carPhoto}
                        resizeMode="contain"
                      />
                    ) : (
                      <View
                        style={[
                          styles.carPhoto,
                          { backgroundColor: "#ccc", justifyContent: "center", alignItems: "center" },
                        ]}
                      >
                        <Text>No hay foto</Text>
                      </View>
                    )}
                    <Text style={styles.carInfoText}>
                      {conductorInfo?.car?.brand || "Marca"} {conductorInfo?.car?.color || "Color"}
                    </Text>
                    <Text style={styles.carInfoPlate}>{conductorInfo?.car?.plate || "Placa"}</Text>
                  </View>
                </View>

                <View style={styles.meetingPointSection}>
                  <Text style={styles.meetingPointText}>
                    <Text style={{ fontWeight: 'bold'}}>
                                    {viajeSeleccionado.haciaLaU ? "Viaje desde:" : "Viaje hacia:"}{" "}
                                  </Text>
                    {viajeSeleccionado?.direccion || "Dirección no disponible"}
                  </Text>
                  
                </View>

                <View style={styles.mapContainer}>
                  <MapComponent 
                    viaje={viajeSeleccionado} 
                    puntosAceptados={viajeSeleccionado?.puntos.filter((p: { estado: string }) => p.estado === "aceptado")} 
                  />
                </View>


                {/* Input para sugerencia */}
                <View style={styles.sugerenciaContainer}>
                <AutocompleteLugar
                  value={sugerencia}
                  onSelect={(direccion: string) => setSugerencia(direccion)}
                />


              </View>


                



                <TouchableOpacity
                  style={[styles.acceptButton, enviando && { opacity: 0.6 }]}
                  onPress={handleAceptar}
                  disabled={enviando}
                >
                  {enviando ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.acceptButtonText}>Solicitar Punto</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <ActivityIndicator size="large" color={colors.blue} />
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "90%",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalCloseButton: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  profileSection: {
    alignSelf: "center",
    position: "relative",
    marginBottom: 10,
  },
  profilePhoto: {
    width: 70,
    height: 70,
    borderRadius: 50,
  
  },
  nameSection: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  nameText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.black,
  },
  ratingNumber: {
    fontWeight: "600",
    fontSize: 16,
    marginRight: 3,
  },
  rowInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  seatsContainer: {
    flex: 1,
  },
  availableSeats: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.black,
  },
  carInfoBox: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginLeft: 10,
  },
  carInfoText: {
    fontWeight: "600",
    fontSize: 16,
    color: colors.black,
  },
  carInfoPlate: {
    fontWeight: "700",
    fontSize: 10,
    color: colors.grey,
  },
  meetingPointSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  meetingPointText: {
    fontWeight: "600",
    fontSize: 13,
    color: colors.darkGrey,
    flex: 1,
  },
  iconRow: {
    flexDirection: "row",
    width: 60,
    justifyContent: "space-between",
  },

  sugerenciaContainer: {
    marginBottom: 15,
  },
  sugerenciaInput: {
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: "top",
  },
  acceptButton: {
    backgroundColor: colors.white,
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.blue,
  },
  acceptButtonText: {
    color: colors.blue,
    fontWeight: "bold",
    fontSize: 20,

  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  dateText: {
    fontSize: 18,
    color: colors.black,
  },
  carPhoto: {
    width: 130,
    height: 130,
    borderRadius: 10,
    marginBottom: 5,
  },
  mapContainer: {
    width: '100%',       // o el ancho que prefieras, puede ser '90%' o fijo
    height: 200,         // altura reducida para que no ocupe mucho espacio
    borderRadius: 10,
    overflow: 'hidden',  // para que el mapa respete los bordes redondeados
    marginBottom: 15,
  },
  
});
