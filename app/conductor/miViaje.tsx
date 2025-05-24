import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/authContext/AuthContext";
import { useViajes } from "@/context/viajeContext/ViajeConductorContext";
import colors from "@/styles/Colors";
import { router } from "expo-router";

export default function CrearViaje() {
  
  const { crearViaje } = useViajes();

  const { user, car } = useAuth();
  const seats = car?.seats ?? 1;  // valor por defecto 1


   const [fecha, setFecha] = useState("");  // ahora texto
  const [hora, setHora] = useState("");    // ahora texto
  const [precio, setPrecio] = useState("15.00");
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("Universidad de la Sabana");

  const [isDestinoEditable, setIsDestinoEditable] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleSwap = () => {
    setIsDestinoEditable(!isDestinoEditable);
    const temp = origen;
    setOrigen(destino);
    setDestino(temp);
  };

  const handleCreateViaje = async () => {
    if (!user) {
      console.error("Usuario no logueado");
      return;
    }
    if (!fecha.trim() || !hora.trim()) {
      alert("Por favor ingresa fecha y hora");
      return;
    }
  
    const nuevoViaje = {
      conductor: user.displayName || "Conductor desconocido",
      haciaLaU: destino === "Universidad de la Sabana",
      direccion: origen,
      fecha: fecha.trim(),
      horaSalida: hora.trim(),
      precio: precio,
      estado: "por iniciar" as const,
      cuposDisponibles:seats , // Asignar un valor por defecto
    };
  
    try {
      const viajeId = await crearViaje(nuevoViaje);
      console.log("Viaje creado con id:", viajeId);
      setModalVisible(true);
  
      // Limpieza de campos
      setFecha("");
      setHora("");
      setOrigen("");
      setDestino("Universidad de la Sabana");
      setPrecio("15.00");
      setIsDestinoEditable(false);
    } catch (error) {
      console.error("Error creando viaje:", error);
      alert("No se pudo crear el viaje, intenta nuevamente.");
    }
  };
  

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color={colors.blue} />
      </TouchableOpacity>

      <Text style={styles.title}>Crea un nuevo viaje</Text>

      {/* Origen y Destino */}
      <View style={styles.originDestContainer}>
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Origen</Text>
          <TextInput
            style={styles.input}
            placeholder="Colina"
            placeholderTextColor={colors.grey}
            value={origen}
            onChangeText={setOrigen}
            autoCapitalize="words"
            returnKeyType="done"
          />
        </View>

        <TouchableOpacity
          style={styles.swapButton}
          onPress={handleSwap}
          activeOpacity={0.7}
        >
          <Ionicons name="swap-vertical" size={28} color={colors.blue} />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Destino</Text>
          <TextInput
            style={[styles.input, isDestinoEditable && styles.inputEditable]}
            value={destino}
            onChangeText={setDestino}
            editable={isDestinoEditable}
            selectTextOnFocus={isDestinoEditable}
            autoCapitalize="words"
            returnKeyType="done"
          />
        </View>
      </View>

      {/* Fecha */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Fecha</Text>
        <TextInput
          style={styles.input}
          placeholder="Ejemplo: 2025-05-23"
          placeholderTextColor={colors.grey}
          value={fecha}
          onChangeText={setFecha}
          keyboardType="default"
          returnKeyType="done"
        />
      </View>

      {/* Hora */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Hora del viaje</Text>
        <TextInput
          style={styles.input}
          placeholder="Ejemplo: 15:30"
          placeholderTextColor={colors.grey}
          value={hora}
          onChangeText={setHora}
          keyboardType="default"
          returnKeyType="done"
        />
      </View>

      {/* Precio */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Precio</Text>
        <View style={styles.priceButtonsContainer}>
          {["15.00", "15.30", "15.10", "15.05"].map((price) => (
            <TouchableOpacity
              key={price}
              style={[
                styles.priceButton,
                precio === price && styles.priceButtonSelected,
              ]}
              onPress={() => setPrecio(price)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.priceText,
                  precio === price && styles.priceTextSelected,
                ]}
              >
                € {price}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Botón Crear viaje */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateViaje}
        activeOpacity={0.8}
      >
        <Text style={styles.createButtonText}>Crear Viaje</Text>
      </TouchableOpacity>

      {/* Modal Confirmación */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>¡Viaje creado!</Text>
            <Text style={styles.modalMessage}>
              Tu viaje ha sido creado con éxito.
            </Text>
            <Pressable
              style={[styles.modalButton, styles.confirmButton]}
              onPress={() => {
                setModalVisible(false);
                router.push("../");
              }}
            >
              <Text style={styles.modalButtonText}>Ir a Inicio</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    marginBottom: 15,
    width: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 25,
  },
  originDestContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  inputWrapper: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: colors.black,
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.black,
    backgroundColor: colors.white,
  },
  inputEditable: {
    borderColor: colors.blue,
    backgroundColor: "#f0f7ff",
  },
  swapButton: {
    width: 60,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  priceButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priceButton: {
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    marginHorizontal: 3,
  },
  priceButtonSelected: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  priceText: {
    color: colors.black,
    fontSize: 16,
    fontWeight: "500",
  },
  priceTextSelected: {
    color: colors.white,
    fontWeight: "700",
  },
  createButton: {
    backgroundColor: colors.blue,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 30,
    alignItems: "center",
  },
  createButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  modalContainer: {
    backgroundColor: colors.white,
    padding: 30,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.black,
    marginBottom: 15,
  },
  modalMessage: {
    fontSize: 16,
    color: colors.grey,
    textAlign: "center",
    marginBottom: 25,
  },
  modalButton: {
    backgroundColor: colors.blue,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  modalButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: colors.blue,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },


});
