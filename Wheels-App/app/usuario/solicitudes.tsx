import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function Solicitudes() {
  const [activeTab, setActiveTab] = useState<"todos" | "aceptados" | "pendientes" | "negados">("todos");  // Estado para controlar la pestaña activa

  const handleTabChange = (tab: "todos" | "aceptados" | "pendientes" | "negados") => {
    setActiveTab(tab);
  };

  const solicitudesData = {
    todos: [
      { title: "Info del viaje aceptado", price: "€ 000", details: "fecha, hora de inicio, dirección, sector", period: "every year" },
      { title: "Info del viaje aceptado", price: "€ 000", details: "fecha, hora de inicio, dirección, sector", period: "every year" },
    ],
    aceptados: [
      { title: "Info del viaje aceptado", price: "€ 000", details: "fecha, hora de inicio, dirección, sector", period: "every year" },
    ],
    pendientes: [
      { title: "Info del viaje aceptado", price: "€ 000", details: "fecha, hora de inicio, dirección, sector", period: "every year" },
    ],
    negados: [
      { title: "Info del viaje aceptado", price: "€ 000", details: "fecha, hora de inicio, dirección, sector", period: "every year" },
    ]
  };

  const renderSolicitudes = () => {
    return solicitudesData[activeTab].map((solicitud, index) => (
      <View key={index} style={styles.solicitudCard}>
        <View style={styles.solicitudInfo}>
          <Text style={styles.solicitudTitle}>{solicitud.title}</Text>
          <Text style={styles.solicitudPrice}>{solicitud.price}</Text>
          <Text style={styles.solicitudDetails}>{solicitud.details}</Text>
          <Text style={styles.solicitudPeriod}>{solicitud.period}</Text>
        </View>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Solicitudes</Text>

      {/* Tabs para cambiar entre los diferentes estados */}
    

      {/* Mostrar solicitudes según la pestaña activa */}
      <ScrollView contentContainerStyle={styles.solicitudesList}>
        {renderSolicitudes()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: "600",
    color: "#000",
    marginBottom: 20,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#EAEAEA",
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "#007BFF", // Azul cuando está activo
  },
  tabText: {
    color: "#000",
    fontWeight: "600",
  },
  solicitudCard: {
    backgroundColor: "#F0F8FF", // Fondo azul claro para cada tarjeta
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
  },
  solicitudInfo: {
    paddingBottom: 10,
  },
  solicitudTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  solicitudPrice: {
    fontSize: 14,
    marginBottom: 5,
  },
  solicitudDetails: {
    fontSize: 12,
    marginBottom: 5,
    color: "#007BFF", // Color azul para los detalles
  },
  solicitudPeriod: {
    fontSize: 12,
    color: "#007BFF", // Color azul para el periodo
  },
  solicitudesList: {
    paddingBottom: 100,
  },
});
