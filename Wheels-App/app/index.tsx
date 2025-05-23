import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Redirect } from "expo-router";
import colors from "../styles/Colors"; // Asegúrate de tener un archivo de colores
import { MaterialIcons } from "@expo/vector-icons"; // Asegúrate de tener instalado react-native-vector-icons

export default function Index() {
  const [step, setStep] = useState(0);  // Para controlar las diferentes vistas
  const [redirect, setRedirect] = useState(false); // Para controlar el redireccionamiento

  const handleNext = () => {
    if (step === 2) {
      setRedirect(true);
    } else {
      setStep(step + 1);
    }
  };

  if (redirect) {
    return <Redirect href="./auth" />;
  }

  // Textos para cada step
  const stepTexts = [
    { title: "Crea tu viaje en segundos", subtitle: "Comienza planificando tu viaje." },
    { title: "Conoce a los conductores", subtitle: "Elige el mejor conductor para tu viaje." },
    { title: "Confirma tu viaje", subtitle: "Revisa los detalles antes de comenzar." }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {/* <Image source={require("assets/images/favicon.png")} style={styles.image} /> */}
      </View>

      <View style={styles.tabContainer}>
        <View style={[styles.tab, step === 0 && styles.activeTab]} />
        <View style={[styles.tab, step === 1 && styles.activeTab]} />
        <View style={[styles.tab, step === 2 && styles.activeTab]} />
      </View>

      <Text style={styles.title}>{stepTexts[step].title}</Text>
      <Text style={styles.subtitle}>{stepTexts[step].subtitle}</Text>

      <TouchableOpacity onPress={handleNext} style={styles.mainButton}>
        <Text style={styles.mainButtonText}>{step === 2 ? "Empezar" : "Siguiente"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",  // Asegura que todo esté alineado hacia la parte superior
    paddingHorizontal: 30,
    backgroundColor: colors.white,  // Fondo blanco
  },
  imageContainer: {
    width: "100%",
    height: 200, // Ajusta el tamaño de la imagen
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",  // Para que la imagen se ajuste bien sin distorsionarse
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 40,
    alignSelf: "flex-start",  // Alinea los puntos a la izquierda
  },
  tab: {
    width: 10,
    height: 10,
    margin: 5,
    borderRadius: 5,
    backgroundColor: "#EAEAEA", // Gris claro
  },
  activeTab: {
    backgroundColor: colors.blue, // Azul cuando está activo
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: colors.black,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.black,
    marginBottom: 40,
  },
  mainButton: {
    backgroundColor: colors.blue, // Azul
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    width: "85%",
    position: "absolute",  // Asegura que el botón esté en la parte inferior
    bottom: 30,  // Ajusta la distancia desde el fondo
  },
  mainButtonText: {
    color: colors.white, // Blanco
    fontSize: 16,
    fontWeight: "600",
  },
});
