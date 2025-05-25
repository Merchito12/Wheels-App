import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import { useAuth } from "@/context/authContext/AuthContext";
import { useViajes } from "@/context/viajeContext/ViajeConductorContext";
import colors from "@/styles/Colors";
import { router } from "expo-router";
import { scheduleAtDate } from "@/services/Notifications"; // tu helper

// Mostrar notifs en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function CrearViaje() {
  const { crearViaje } = useViajes();
  const { user, car } = useAuth();
  const seats = car?.seats ?? 1;

  const [tripDate, setTripDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [precio, setPrecio] = useState("15.00");
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("Universidad de la Sabana");
  const [isDestinoEditable, setIsDestinoEditable] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleBack = () => router.back();

  const handleSwap = () => {
    setIsDestinoEditable(!isDestinoEditable);
    setDestino(prev => {
      const temp = origen;
      setOrigen(prev);
      return temp;
    });
  };

  const onChangeDate = (_: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      const newDate = new Date(tripDate);
      newDate.setFullYear(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      );
      setTripDate(newDate);
    }
  };

  const onChangeTime = (_: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      const newDate = new Date(tripDate);
      newDate.setHours(
        selectedTime.getHours(),
        selectedTime.getMinutes()
      );
      setTripDate(newDate);
    }
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleCreateViaje = async () => {
    if (!user) {
      console.error("Usuario no logueado");
      return;
    }
    if (!origen.trim()) {
      Alert.alert("Error", "Por favor ingresa el origen");
      return;
    }

    const nuevoViaje = {
      conductor: user.displayName || "Conductor desconocido",
      haciaLaU: destino === "Universidad de la Sabana",
      direccion: origen,
      fecha: formatDate(tripDate),
      horaSalida: formatTime(tripDate),
      precio,
      estado: "por iniciar" as const,
      cuposDisponibles: seats,
    };

    try {
      const viajeId = await crearViaje(nuevoViaje);
      console.log("Viaje creado con id:", viajeId);

      // calcular trigger 2 minutos antes
      const triggerDate = new Date(tripDate.getTime() - 2 * 60 * 1000);

      // programar notificación con el helper
      await scheduleAtDate(
        "Tu viaje está por iniciar",
        `Origen: ${origen}. Sale en 2 minutos.`,
        triggerDate
      );

      setModalVisible(true);

      // reset
      setOrigen("");
      setDestino("Universidad de la Sabana");
      setPrecio("15.00");
      setIsDestinoEditable(false);
      setTripDate(new Date());
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Error",
        "No se pudo crear el viaje ni programar la notificación."
      );
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color={colors.blue} />
      </TouchableOpacity>
      <Text style={styles.title}>Crea un nuevo viaje</Text>

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
          />
        </View>
        <TouchableOpacity style={styles.swapButton} onPress={handleSwap}>
          <Ionicons
            name="swap-vertical"
            size={28}
            color={colors.blue}
          />
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
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Fecha de salida</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.pickerText}>
            {formatDate(tripDate)}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={tripDate}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Hora de salida</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.pickerText}>
            {formatTime(tripDate)}
          </Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={tripDate}
            mode="time"
            display="default"
            onChange={onChangeTime}
          />
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Precio</Text>
        <View style={styles.priceButtonsContainer}>
          {["15.00", "15.30", "15.10", "15.05"].map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.priceButton,
                precio === p && styles.priceButtonSelected,
              ]}
              onPress={() => setPrecio(p)}
            >
              <Text
                style={[
                  styles.priceText,
                  precio === p && styles.priceTextSelected,
                ]}
              >
                € {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateViaje}
      >
        <Text style={styles.createButtonText}>Crear Viaje</Text>
      </TouchableOpacity>

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
              <Text style={styles.modalButtonText}>
                Ir a Inicio
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.white, padding: 20 },
  backButton: { marginBottom: 15, width: 40 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 25,
  },
  originDestContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 25,
  },
  inputWrapper: { flex: 1 },
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
    padding: 12,
    fontSize: 16,
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
  inputGroup: { marginBottom: 20 },
  pickerButton: {
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.white,
  },
  pickerText: { fontSize: 16, color: colors.black },
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
  },
  priceButtonSelected: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  priceText: {
    color: colors.black,
    fontSize: 16,
  },
  priceTextSelected: {
    color: colors.white,
    fontWeight: "700",
  },
  createButton: {
    backgroundColor: colors.blue,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
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
    padding: 30,
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
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  confirmButton: {
    backgroundColor: colors.blue,
    marginTop: 20,
  },
  modalButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
