import React, { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";

const GOOGLE_API_KEY = 'AIzaSyB0ex9gl00soXNo5bAY1yubQvWpJXr5HqY';

export default function AutocompleteLugar({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (text: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const buscarSugerencias = async (text: string) => {
    setQuery(text);
    if (text.length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${GOOGLE_API_KEY}&language=es&components=country:co`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log("Respuesta API Places:", data);
      if (data.predictions) {
        setResults(data.predictions);
        setShowDropdown(true);
      }
    } catch (error) {
      console.error("Error en la API de Google Places:", error);
    }
  };

  const seleccionarLugar = async (descripcion: string, placeId: string) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API_KEY}&language=es&fields=geometry`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.result?.geometry?.location) {
        console.log("Ubicación válida. Coordenadas:", data.result.geometry.location);
        onSelect(descripcion);
        setQuery(descripcion);
        setResults([]);
        setShowDropdown(false);
      } else {
        Alert.alert("Ubicación inválida", "Google no pudo convertir esta dirección en coordenadas.");
      }
    } catch (error) {
      console.error("Error al validar la dirección:", error);
      Alert.alert("Error", "Hubo un problema al validar la ubicación con Google.");
    }
  };

  return (
    <View style={styles.wrapper}>
      <TextInput
        placeholder="Ingresa tu punto..."
        style={styles.input}
        value={query}
        onChangeText={buscarSugerencias}
      />
      {showDropdown && results.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={results}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => seleccionarLugar(item.description, item.place_id)}
              >
                <Text style={styles.resultText}>{item.description}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    wrapper: {
      position: "relative",
      zIndex: 999, // importante para mostrar sobre otros componentes
    },
    input: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: "#fff",
      zIndex: 1000,
    },
    dropdown: {
      position: "absolute",
      top: 55,
      left: 0,
      right: 0,
      backgroundColor: "#fff",
      borderColor: "#ccc",
      borderWidth: 1,
      borderRadius: 8,
      maxHeight: 200,
      elevation: 10, // Android
      shadowColor: "#000", // iOS
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      zIndex: 1001,
    },
    resultItem: {
      padding: 12,
      borderBottomColor: "#eee",
      borderBottomWidth: 1,
    },
    resultText: {
      fontSize: 16,
      color: "#333",
    },
  });
