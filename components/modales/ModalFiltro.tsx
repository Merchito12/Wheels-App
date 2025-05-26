import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  TextInput,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import colors from "../../styles/Colors";

interface ModalFiltroProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: {
    tipoViaje: "desde" | "hacia" | "";
    fechaFiltro: "hoy" | "mañana" | "personalizado" | "";
    fechaPersonalizada?: Date | null;
    precioMin?: number | null;
    precioMax?: number | null;
  }) => void;
}

export default function ModalFiltro({ visible, onClose, onApplyFilters }: ModalFiltroProps) {
  const [tipoViaje, setTipoViaje] = useState<"desde" | "hacia" | "">("");
  const [fechaFiltro, setFechaFiltro] = useState<"hoy" | "mañana" | "personalizado" | "">("");
  const [fechaPersonalizada, setFechaPersonalizada] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [precioMin, setPrecioMin] = useState<string>("");
  const [precioMax, setPrecioMax] = useState<string>("");

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setFechaPersonalizada(selectedDate);
      setFechaFiltro("personalizado");
    }
  };

  const limpiarFiltros = () => {
    setTipoViaje("");
    setFechaFiltro("");
    setFechaPersonalizada(null);
   
  };

  const aplicarFiltros = () => {
    onApplyFilters({
      tipoViaje,
      fechaFiltro,
      fechaPersonalizada,

    });
    onClose();
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Filtrar viajes</Text>

          <Text style={styles.label}>Tipo de viaje:</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.optionButton, tipoViaje === "desde" && styles.optionButtonSelected]}
              onPress={() => setTipoViaje(tipoViaje === "desde" ? "" : "desde")}
            >
              <Text style={styles.optionText}>Desde la U</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, tipoViaje === "hacia" && styles.optionButtonSelected]}
              onPress={() => setTipoViaje(tipoViaje === "hacia" ? "" : "hacia")}
            >
              <Text style={styles.optionText}>Hacia la U</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Fecha:</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.optionButton, fechaFiltro === "hoy" && styles.optionButtonSelected]}
              onPress={() => setFechaFiltro(fechaFiltro === "hoy" ? "" : "hoy")}
            >
              <Text style={styles.optionText}>Hoy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, fechaFiltro === "mañana" && styles.optionButtonSelected]}
              onPress={() => setFechaFiltro(fechaFiltro === "mañana" ? "" : "mañana")}
            >
              <Text style={styles.optionText}>Mañana</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, fechaFiltro === "personalizado" && styles.optionButtonSelected]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.optionText}>
                {fechaPersonalizada ? fechaPersonalizada.toLocaleDateString() : "Seleccionar"}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={fechaPersonalizada || new Date()}
              mode="date"
              display="default"
              onChange={onChangeDate}
              minimumDate={new Date()}
            />
          )}

          

          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.clearButton} onPress={limpiarFiltros}>
              <Text style={styles.clearButtonText}>Limpiar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.applyButton} onPress={aplicarFiltros}>
              <Text style={styles.applyButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  label: {
    fontWeight: "600",
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    marginTop: 8,
    justifyContent: "space-around",
    alignItems: "center",
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  optionButtonSelected: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  optionText: {
    color: colors.black,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: "45%",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  clearButton: {
    backgroundColor: colors.lightGrey,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  clearButtonText: {
    color: colors.black,
    fontWeight: "bold",
  },
  applyButton: {
    backgroundColor: colors.blue,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  applyButtonText: {
    color: colors.white,
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 15,
    alignSelf: "center",
  },
  closeButtonText: {
    color: colors.blue,
  },
});
