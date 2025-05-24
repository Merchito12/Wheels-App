import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function Mapa() {
  const initialRegion = {
    latitude: 4.648625,    // Bogotá ejemplo
    longitude: -74.247895,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        <Marker
          coordinate={{ latitude: 4.648625, longitude: -74.247895 }}
          title="Bogotá"
          description="Capital de Colombia"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
