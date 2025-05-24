import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Modal,
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
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.black} />
          </TouchableOpacity>

          {viajeSeleccionado ? (
            <>
              <Text style={styles.modalTitle}>Detalles del Viaje</Text>

              <Text style={styles.modalLabel}>Dirección:</Text>
              <Text style={styles.modalText}>{viajeSeleccionado.direccion}</Text>

              <Text style={styles.modalLabel}>Fecha:</Text>
              <Text style={styles.modalText}>{viajeSeleccionado.fecha}</Text>

              <Text style={styles.modalLabel}>Hora de Salida:</Text>
              <Text style={styles.modalText}>{viajeSeleccionado.horaSalida}</Text>

              <Text style={styles.modalLabel}>Precio:</Text>
              <Text style={styles.modalText}>€ {viajeSeleccionado.precio}</Text>

              <Text style={[styles.modalTitle, { marginTop: 25 }]}>
                Información del Conductor
              </Text>

              {cargandoConductor ? (
                <ActivityIndicator size="small" color={colors.blue} />
              ) : conductorInfo ? (
                <>
                  {conductorInfo.car?.photoURL && (
                    <Image
                      source={{ uri: conductorInfo.car.photoURL }}
                      style={styles.carPhoto}
                      resizeMode="cover"
                    />
                  )}

                  <Text style={styles.modalLabel}>Nombre:</Text>
                  <Text style={styles.modalText}>
                    {conductorInfo.name || "No disponible"}
                  </Text>

                  <Text style={styles.modalLabel}>Email:</Text>
                  <Text style={styles.modalText}>
                    {conductorInfo.email || "No disponible"}
                  </Text>

                  <Text style={styles.modalLabel}>Rol:</Text>
                  <Text style={styles.modalText}>
                    {conductorInfo.role || "No disponible"}
                  </Text>

                  <Text style={styles.modalLabel}>Carro:</Text>
                  <Text style={styles.modalText}>
                    {conductorInfo.car?.brand || "No disponible"} - Placa:{" "}
                    {conductorInfo.car?.plate || "No disponible"}
                  </Text>
                </>
              ) : (
                <Text style={styles.modalText}>No hay información del conductor</Text>
              )}

              <TouchableOpacity style={styles.acceptButton} onPress={onAceptar}>
                <Text style={styles.acceptButtonText}>Aceptar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <ActivityIndicator size="large" color={colors.blue} />
          )}
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
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 25,
    width: "90%",
    maxHeight: "80%",
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
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: colors.blue,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    color: colors.darkGrey,
  },
  modalText: {
    fontSize: 16,
    color: colors.black,
  },
  carPhoto: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    marginBottom: 15,
  },
  acceptButton: {
    marginTop: 30,
    backgroundColor: colors.blue,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
  },
  acceptButtonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 18,
  },
});
