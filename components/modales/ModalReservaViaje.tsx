import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../styles/Colors";

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
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
              <Ionicons name="close" size={28} color={colors.black} />
            </TouchableOpacity>

            {viajeSeleccionado ? (
              <>

                <View style={styles.profileSection}>
                  {conductorInfo?.profilePhotoURL? (
                <Image
                 source={{ uri: conductorInfo.profilePhotoURL }}
                style={styles.profilePhoto}
                 resizeMode="cover"
                />
                ) : (
                     <View style={[styles.profilePhoto, {backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center'}]}>
                 <Text>No hay foto</Text>
                </View>
                )}
                </View>

             
                <View style={styles.nameSection}>
                  <Text style={styles.nameText}>{conductorInfo?.name || "No disponible"}</Text>
                    <Text style={styles.ratingNumber}>5</Text>
                    <Ionicons name="star" size={18} color="#FFD700" />
                </View>

                <View style={styles.rowInfoContainer}>
                    
                  <View style={styles.seatsContainer}>
                    <View style={styles.row}>
                  <Ionicons
                    name="calendar-outline"
                    size={25}
                    color={colors.grey}
                  />
                  <Text style={styles.dateText}> {viajeSeleccionado.fecha}</Text>
                </View>
                <View style={styles.row}>
                  <Ionicons name="time-outline" size={25} color={colors.grey} />
                  <Text style={styles.dateText}> {viajeSeleccionado.horaSalida}</Text>
                </View>
                    <Text style={styles.availableSeats}>
                      {viajeSeleccionado.cuposDisponibles} cupo{(conductorInfo?.car?.seats ?? 1) > 1 ? "s" : ""} disponible{(conductorInfo?.car?.seats ?? 1) > 1 ? "s" : ""}
                    
                    </Text>
              
                  
                    
                  </View>

                <View style={styles.carInfoBox}>
                {conductorInfo?.car?.photoURL ? (
                 <Image
                  source={{ uri: conductorInfo.car.photoURL }}
                  style={styles.carPhoto}
                   resizeMode="cover"
                  />
                    ) : (
                  <View style={[styles.carPhoto, {backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center'}]}>
                  <Text>No hay foto</Text>
                 </View>
                    )}  
                 <Text style={styles.carInfoText}>
                  {conductorInfo?.car?.brand || "Marca"} {conductorInfo?.car?.color || "Color"}
                 </Text>
  
                 <Text style={styles.carInfoPlate}>{conductorInfo?.car?.plate || "Placa"}</Text>
                </View>

                </View>

                {/* Reseñas */}
                <View style={styles.reviewsContainer}>
                  <Text style={styles.sectionTitle}>Reseñas</Text>
                  <View style={styles.reviewBox}>
                    <Text style={styles.reviewAuthor}>Manguito</Text>
                    <View style={styles.reviewStars}>
                      {[...Array(5)].map((_, i) => (
                        <Ionicons key={i} name="star" size={16} color="#FFD700" />
                      ))}
                    </View>
                    <Text style={styles.reviewText}>
                      "Lorem ipsum gusta mi novia aunque no me envíe picos"
                    </Text>
                  </View>
                </View>

                {/* Punto de encuentro */}
                <View style={styles.meetingPointSection}>
                  <Text style={styles.meetingPointText}>
                    Punto de encuentro: {viajeSeleccionado?.direccion || "Dirección no disponible"}
                  </Text>
                  <View style={styles.iconRow}>
                    <Ionicons name="navigate" size={24} color={colors.blue} />
                    <Ionicons name="map" size={24} color={colors.black} />
                  </View>
                </View>

                {/* Imagen/mapa de ruta */}
                <Image
                  source={{ uri: viajeSeleccionado?.mapImageUri || "" }}
                  style={styles.mapImage}
                  resizeMode="cover"
                />

                {/* Botones */}
                <View style={styles.buttonsRow}>
                  <TouchableOpacity style={styles.outlinedButton}>
                    <Text style={styles.outlinedButtonText}>Sugerir Punto</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.outlinedButton}>
                    <Text style={styles.outlinedButtonText}>Añadir Comentario</Text>
                  </TouchableOpacity>
                </View>

                {/* Botón aceptar */}
                <TouchableOpacity style={styles.acceptButton} onPress={onAceptar}>
                  <Text style={styles.acceptButtonText}>Aceptar</Text>
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
    width: "95%",
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
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: colors.blue,
  },
  verificationBadge: {
    position: "absolute",
    right: -5,
    bottom: 0,
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    padding: 2,
  },
  nameSection: {
    alignItems: "center",
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  nameText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.black,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  ratingNumber: {
    fontWeight: "600",
    fontSize: 16,
    marginRight: 3,
  },
  ratingCount: {
    fontSize: 14,
    color: colors.grey,
    marginLeft: 8,
  },
  membershipText: {
    fontSize: 14,
    color: colors.grey,
    marginTop: 4,
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
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignItems: "center",
    marginLeft: 10,
  },
  carInfoText: {
    fontWeight: "600",
    fontSize: 16,
    color: colors.black,
  },
  carInfoPlate: {
    fontWeight: "700",
    fontSize: 20,
    color: colors.blue,
  },
  reviewsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: colors.black,
  },
  reviewBox: {
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 15,
    padding: 15,
  },
  reviewAuthor: {
    fontWeight: "700",
    marginBottom: 4,
    fontSize: 16,
  },
  reviewStars: {
    flexDirection: "row",
    marginBottom: 8,
  },
  reviewText: {
    fontStyle: "italic",
    color: colors.darkGrey,
  },
  meetingPointSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  meetingPointText: {
    fontWeight: "600",
    fontSize: 16,
    color: colors.black,
    flex: 1,
  },
  iconRow: {
    flexDirection: "row",
    width: 60,
    justifyContent: "space-between",
  },
  mapImage: {
    width: "100%",
    height: 120,
    borderRadius: 15,
    marginBottom: 20,
    backgroundColor: "#ccc",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  outlinedButton: {
    borderWidth: 1,
    borderColor: colors.blue,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "45%",
    alignItems: "center",
  },
  outlinedButtonText: {
    color: colors.blue,
    fontWeight: "600",
    fontSize: 16,
  },
  acceptButton: {
    backgroundColor: colors.blue,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },
  acceptButtonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 20,
  },
  carPhoto: {   
    width: 130,
    height: 130,
    borderRadius: 10,
    marginBottom: 5,
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
});
