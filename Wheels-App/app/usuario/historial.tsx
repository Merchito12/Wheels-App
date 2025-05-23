import colors from '@/styles/Colors';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Searchbar } from 'react-native-paper';  // Importar Searchbar de Expo
import { SortIcon,StarIcon,ArrowRight } from '@/components/Icons';  // Asegúrate de tener este icono
export default function MisViajes() {
  const [searchQuery, setSearchQuery] = useState('');  // Estado para la búsqueda

  const onChangeSearch = (query: React.SetStateAction<string>) => setSearchQuery(query);

  // Datos simulados para los viajes (como si vinieran de una base de datos)
  const viajes = [
    { id: 1, fecha: '12/05/2025, 10:00', direccion: 'Calle 123', parada: 'Parada A' },
    { id: 2, fecha: '13/05/2025, 14:00', direccion: 'Calle 456', parada: 'Parada B' },
    { id: 3, fecha: '14/05/2025, 16:00', direccion: 'Calle 789', parada: 'Parada C' },
     { id: 3, fecha: '14/05/2025, 16:00', direccion: 'Calle 789', parada: 'Parada C' },
      { id: 3, fecha: '14/05/2025, 16:00', direccion: 'Calle 789', parada: 'Parada C' },
      
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tus viajes Anteriores</Text>

      {/* Barra de búsqueda */}
      <Searchbar
        placeholder="Buscar viaje..."
        value={searchQuery}
        onChangeText={onChangeSearch}
        style={styles.searchbar}
      />
          <TouchableOpacity style={styles.sort}>
          <SortIcon color={colors.grey} /> <Text style={styles.buttonText}>Sort</Text>
        </TouchableOpacity>
    
      <ScrollView showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {viajes.map((viaje) => (
          <View key={viaje.id} style={styles.tripCard}>
            <Image
               source={require("../../assets/images/carImage.png")} 
              style={styles.image}
            />
            <View style={styles.tripInfo}>
              <Text style={styles.tripDate}>{viaje.fecha}</Text>
              <Text style={styles.tripDetails}>
                {viaje.direccion}, {viaje.parada}
              </Text>
            </View>
            <View style={styles.starsContainer}>
             <Text style={styles.tripDetails}>5</Text>
            <StarIcon color={colors.blue} />
      
            </View>
             <ArrowRight  color={colors.grey} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
    backgroundColor:colors.white ,
  },
  starsContainer: { 
    flexDirection: 'row',  // Alinea los elementos en fila
    alignItems: 'center',  // Centra verticalmente
    marginBottom:0,
    justifyContent: 'space-between',
    marginRight: 50,
  },
  sort: {
    width: 100,
    backgroundColor: colors.lightBlue,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    flexDirection: 'row',  
    alignItems: 'center',  
  },
  header: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000',
    marginBottom: 20,
  },
  searchbar: {
    marginBottom: 20,
    backgroundColor: colors.lightGrey,
  },
  scrollContainer: {
    
    paddingTop:20, 
    paddingBottom:100, 
  },
  tripCard: {
    backgroundColor: colors.lightBlue, 
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    flexDirection: 'row',  
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.lightGreyrows,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    marginRight: 10,
    marginLeft: 10,
  },
  image: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    borderRadius: 25,
    marginRight: 15,  
  },
  tripInfo: {
    flex: 1,
  },
  tripDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  buttonText: {
    marginLeft: 10, 
    color: colors.black,
    fontSize: 16,
  },
  tripDetails: {
    fontSize: 14,
    color: '#888',
    marginRight: 10,
  },
  viewButton: {
    backgroundColor: colors.blue,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
