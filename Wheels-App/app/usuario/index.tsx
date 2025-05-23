import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from "react-native";
import { Searchbar } from "react-native-paper";
import colors from "../../styles/Colors"; 
import { SortIcon, FilterIcon } from "../../components/Icons"; 

export default function Index() {
  const [step, setStep] = useState(0);  // Para controlar las diferentes vistas
  const [redirect, setRedirect] = useState(false); // Para controlar el redireccionamiento
  const [searchQuery, setSearchQuery] = useState("");

  const onChangeSearch = (query: React.SetStateAction<string>) => setSearchQuery(query);
  
  return (
    <View style={styles.container}>

      <Searchbar
        placeholder="Buscar viaje..."
        value={searchQuery}
        onChangeText={onChangeSearch}
        style={styles.barraBusqueda}
      />
      <View style={styles.buttonsContainer}>
        

        <TouchableOpacity style={styles.sort}>
          <SortIcon color={colors.grey} /> <Text style={styles.buttonText}>Sort</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.filter}>       
        <FilterIcon color={colors.grey} /> <Text style={styles.buttonText}>Filter</Text>
        </TouchableOpacity>
      </View>

 
      <View style={styles.headerContainer}>
  <View style={styles.textContainer}>
    <Text style={styles.headerTitle}>Viaje en Curso</Text>
    <Text style={styles.headerSubtitle}>
      fecha, hora de inicio, dirección, sector
    </Text>
    <TouchableOpacity style={styles.detailsButton}>
      <Text style={styles.detailsButtonText}>Ver detalles</Text>
    </TouchableOpacity>
  </View>
  <Image
    source={require("../../assets/images/carImage.png")}  // Ruta local a tu imagen
    style={styles.carImage}
  />
</View>


      {/* Viajes disponibles */}
      <ScrollView showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        <View style={styles.tripsContainer}>
          {["Viaje 1", "Viaje 2", "Viaje 3", "Viaje 4", "Viaje 4"].map((viaje, index) => (
            <View key={index} style={styles.tripCard}>
              <Image
      source={require("../../assets/images/carImage.png")}
                style={styles.image}
              />
              <Text style={styles.tripName}>{viaje}</Text>
              <Text style={styles.tripPrice}>€ 12.00</Text>
              <TouchableOpacity style={styles.reserveButton}>
                <Text style={styles.reserveButtonText}>Reservar</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  barraBusqueda: {
    marginBottom: 20,
    backgroundColor: colors.lightGrey,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,  // Para darle espacio a los botones
  },
  headerContainer: {
    backgroundColor: colors.blue,
    padding: 20,
    paddingRight: 0,
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: "row",  // Coloca los elementos en fila
    justifyContent: "space-between",  // Espacio entre los textos y la imagen
    alignItems: "center",  // Alinea verticalmente
  },
  textContainer: {
    flex: 1,  // Hace que el texto ocupe el espacio disponible en el contenedor
    justifyContent: "center",  // Centra el contenido verticalmente
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 10,
  },
  headerSubtitle: {
   
    fontSize: 14,
    color: colors.white,
    marginBottom: 20,
  },carImage: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    borderRadius: 10,
  },
  detailsButton: {
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    width: 110,
  },
  detailsButtonText: {
    color: colors.blue,
   
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sort: {
    backgroundColor: colors.lightBlue,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    flexDirection: 'row',  
    alignItems: 'center',  
  },
  filter: {
    backgroundColor: colors.lightBlue,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    flexDirection: 'row', 
    alignItems: 'center',  
  },
  buttonText: {
    marginLeft: 10, 
    color: colors.black,
    fontSize: 16,
  },
  tripsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  tripCard: {
    backgroundColor: colors.lightGrey,
    width: "48%",
    marginBottom: 15,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.lightGreyrows,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    
  },
  
  image: {
    width: "100%",
    height: 100,
    resizeMode: "contain",
    borderRadius: 5,
    marginBottom: 10,
  },
  tripName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  tripPrice: {
    fontSize: 14,
    marginBottom: 15,
  },
  reserveButton: {
    backgroundColor: colors.blue,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  reserveButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  mainButton: {
    backgroundColor: colors.blue,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    width: "85%",
    position: "absolute",
    bottom: 30,
  },
  mainButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
