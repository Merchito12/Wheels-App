import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
  Alert,
  TextInput,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import { useAuth } from "@/context/authContext/AuthContext";
import { useViajes } from "@/context/viajeContext/ViajeConductorContext";
import colors from "@/styles/Colors";
import { router } from "expo-router";
import { scheduleAtDate } from "@/services/Notifications";
import AutocompleteLugar from "@/components/shared/Autocomplete";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const GOOGLE_API_KEY = "AIzaSyB0ex9gl00soXNo5bAY1yubQvWpJXr5HqY";

async function obtenerRuta(origen: string, destino: string) {
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
    origen
  )}&destination=${encodeURIComponent(
    destino
  )}&key=${GOOGLE_API_KEY}&language=es`;

  const response = await fetch(url);
  const data = await response.json();

  if (
    data.routes?.[0]?.legs?.[0]?.distance &&
    data.routes?.[0]?.legs?.[0]?.duration
  ) {
    const distanciaKm = data.routes[0].legs[0].distance.value / 1000;
    const duracionMin = data.routes[0].legs[0].duration.value / 60;
    return { distanciaKm, duracionMin };
  } else {
    throw new Error("No se pudo obtener la ruta de Google");
  }
}

export default function CrearViaje() {
  const { crearViaje } = useViajes();
  const { user, car } = useAuth();
  const seats = car?.seats ?? 1;

  const [tripDate, setTripDate] = useState(new Date());
  const [precio, setPrecio] = useState("---");
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("Universidad de la Sabana");
  const [isDestinoEditable, setIsDestinoEditable] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [distanciaKm, setDistanciaKm] = useState<number | null>(null);
  const [duracionMin, setDuracionMin] = useState<number | null>(null);
  function formatearMilesConPuntos(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  
  

  useEffect(() => {
    const calcularRutaYPrecio = async () => {
      if (origen.trim() && destino.trim()) {
        try {
          const { distanciaKm, duracionMin } = await obtenerRuta(origen, destino);
          setDistanciaKm(distanciaKm);
          setDuracionMin(duracionMin);
          const nuevoPrecio = sugerirPrecio(distanciaKm, duracionMin);
          setPrecio(nuevoPrecio);
        } catch (error) {
          console.error("Error al calcular la ruta:", error);
          Alert.alert("Error", "No se pudo calcular la ruta ni el precio.");
          setDistanciaKm(null);
          setDuracionMin(null);
          setPrecio("---");
        }
      } else {
        // Si origen o destino están vacíos, limpia datos
        setDistanciaKm(null);
        setDuracionMin(null);
        setPrecio("---");
      }
    };
    calcularRutaYPrecio();
  }, [origen, destino]);

  const sugerirPrecio = (km: number, minutos: number) => {
    const base = 4000;
    const costoKm = 100;
    const costoMin = 100;
    const total = base + km * costoKm + minutos * costoMin;
    return formatearMilesConPuntos(Math.round(total));
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

  const handleSwap = () => {
    setIsDestinoEditable((prev) => {
      const nuevoEstado = !prev;
      if (nuevoEstado) {
        setOrigen("Universidad de la Sabana");
        setDestino("");
      } else {
        setOrigen("");
        setDestino("Universidad de la Sabana");
      }
      return nuevoEstado;
    });
  };

  const onChangeDate = (_: any, selectedDate?: Date) => {
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
    if (selectedTime) {
      const newDate = new Date(tripDate);
      newDate.setHours(
        selectedTime.getHours(),
        selectedTime.getMinutes()
      );
      setTripDate(newDate);
    }
  };

  const handleCreateViaje = async () => {
    if (!user) {
      console.error("Usuario no logueado");
      return;
    }
    const direccion = isDestinoEditable ? destino : origen;
    if (!direccion.trim()) {
      Alert.alert("Error", "Por favor ingresa la dirección");
      return;
    }

    try {
      const { distanciaKm, duracionMin } = await obtenerRuta(origen, destino);
      const precioSugerido = sugerirPrecio(distanciaKm, duracionMin);
      setPrecio(precioSugerido);

      const nuevoViaje = {
        conductor: user.displayName || "Conductor desconocido",
        haciaLaU: !isDestinoEditable,
        direccion,
        fecha: formatDate(tripDate),
        horaSalida: formatTime(tripDate),
        precio: precioSugerido,
        estado: "por iniciar" as const,
        cuposDisponibles: seats,
      };

      const viajeId = await crearViaje(nuevoViaje);
      console.log("Viaje creado con id:", viajeId);

      const triggerDate = new Date(tripDate.getTime() - 2 * 60 * 1000);
      await scheduleAtDate(
        "Tu viaje está por iniciar",
        `Origen: ${origen}. Sale en 2 minutos.`,
        triggerDate
      );

      setModalVisible(true);
      setOrigen("");
      setDestino("Universidad de la Sabana");
      setPrecio("---");
      setIsDestinoEditable(false);
      setTripDate(new Date());
      setDistanciaKm(null);
      setDuracionMin(null);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo crear el viaje ni calcular la ruta.");
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={colors.blue} />
      </TouchableOpacity>
      <Text style={styles.title}>Crea un nuevo viaje</Text>

      <View style={styles.swapContainer}>
        <View style={styles.inputWrapperLeft}>
          {isDestinoEditable ? (
            <Text style={styles.inputEditable}>{origen}</Text>
          ) : (
            <AutocompleteLugar value={origen} onSelect={(direccion) => setOrigen(direccion)} />
          )}

          <Text style={[{marginTop: 0.5 }]}></Text>
          {isDestinoEditable ? (
            <AutocompleteLugar value={destino} onSelect={(direccion) => setDestino(direccion)} />
          ) : (
            <Text style={styles.inputEditable}>{destino}</Text>
          )}
        </View>

        <TouchableOpacity style={styles.swapButtonRight} onPress={handleSwap}>
          <Ionicons name="swap-vertical" size={28} color={colors.blue} />
        </TouchableOpacity>
      </View>

      {/* Mostrar duración y distancia con iconos */}
      {distanciaKm !== null && duracionMin !== null && (
        <View style={styles.inputGroupFull}>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color={colors.blue} style={styles.icon} />
            <Text style={styles.label}>
              Duración estimada: <Text style={styles.infoText}>{Math.round(duracionMin)} minutos</Text>
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="navigate-outline" size={20} color={colors.blue} style={styles.icon} />
            <Text style={styles.label}>
              Distancia estimada: <Text style={styles.infoText}>{distanciaKm.toFixed(2)} km</Text>
            </Text>
          </View>
        </View>
      )}

      <View style={styles.inputGroupFull}>
      <Text style={styles.label}>Fecha</Text>
      <DateTimePicker
          style={styles.pickerFull}
          value={tripDate}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      </View>

      <View style={styles.inputGroupFull}>
        <Text style={styles.label}>Hora de salida</Text>
        <DateTimePicker
          style={styles.pickerFull}
          value={tripDate}
          mode="time"
          display="default"
          onChange={onChangeTime}
        />
      </View>

      <View style={styles.inputGroupFull}>
        <Text style={styles.label}>Precio sugerido</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 18, marginRight: 10 }}>$</Text>
          <TextInput
            style={{
              borderColor: colors.grey,
              borderRadius: 8,
              padding: 10,
              fontSize: 16,
              flex: 1,
            }}
            keyboardType="numeric"
            value={precio}
            onChangeText={setPrecio}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.createButton} onPress={handleCreateViaje}>
        <Text style={styles.createButtonText}>Crear Viaje</Text>
      </TouchableOpacity>

      <Modal transparent visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>¡Viaje creado!</Text>
            <Text style={styles.modalMessage}>Tu viaje ha sido creado con éxito.</Text>
            <Pressable style={[styles.modalButton, styles.confirmButton]} onPress={() => {
              setModalVisible(false);
              router.push("../");
            }}>
              <Text style={styles.modalButtonText}>Ir a Inicio</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.white, padding: 20, paddingTop: 80 },
  backButton: { marginBottom: 15, width: 40 },
  title: { fontSize: 28, fontWeight: "bold", color: colors.black, marginBottom: 25 },
  swapContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  inputWrapperLeft: { flex: 1, marginRight: 10 },
  label: { fontSize: 16, color: colors.black, marginBottom: 8, fontWeight: "600" },
  inputEditable: { borderWidth: 1, borderColor: colors.blue, borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: "#f0f7ff", color: colors.black },
  swapButtonRight: { padding: 10, justifyContent: "center", alignItems: "center" },
  inputGroupFull: { width: "100%", marginBottom: 20, flexDirection: "column" },
  pickerFull: { width: "100%" },
  createButton: { backgroundColor: colors.white, borderRadius: 12,
     padding: 12, alignItems: "center",
    borderWidth: 1, borderColor: colors.blue, shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  createButtonText: { color: colors.blue, fontSize: 18, fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 30 },
  modalContainer: { backgroundColor: colors.white, padding: 30, borderRadius: 12, alignItems: "center", width: "100%", maxWidth: 360 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: colors.black, marginBottom: 15 },
  modalMessage: { fontSize: 16, color: colors.grey, textAlign: "center", marginBottom: 25 },
  modalButton: { borderRadius: 8, paddingVertical: 12, paddingHorizontal: 30 },
  confirmButton: { backgroundColor: colors.blue, marginTop: 20 },
  modalButtonText: { color: colors.white, fontSize: 16, fontWeight: "600" },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  icon: { marginRight: 8 },
  infoText: { fontWeight: "700", color: colors.blue },
});
