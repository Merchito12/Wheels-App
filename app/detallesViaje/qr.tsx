import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import colors from '@/styles/Colors';
import { useViajes } from '@/context/viajeContext/ViajeConductorContext';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function ViajeDetalleScreen() {
  const { params } = useRoute();
  type ParamsType = {
    id: string;
    direccion: string;
    precio: number;
    puntos: any[];
  };

  const { id, direccion, precio, puntos } = params as ParamsType;
  const { obtenerPuntosPorEstado } = useViajes();

  type PuntoType = {
    idCliente: string;
    direccion: string;
    [key: string]: any;
  };

  const [aceptados, setAceptados] = useState<{ punto: PuntoType }[]>([]);
  const [pendientes, setPendientes] = useState<{ punto: PuntoType }[]>([]);

  useEffect(() => {
    async function cargarPuntos() {
      const aceptadosData = await obtenerPuntosPorEstado("aceptado");
      const pendientesData = await obtenerPuntosPorEstado("pendiente");
      setAceptados(aceptadosData.filter(p => p.viajeId === id));
      setPendientes(pendientesData.filter(p => p.viajeId === id));
    }
    cargarPuntos();
  }, [id]);

  return (
    <ScrollView style={styles.container}>
      {/* Imagen de mapa estática */}
      <Image
        source={require('@/assets/images/map.png')} // Asegúrate de tener esta imagen en tu proyecto
        style={styles.mapImage}
        resizeMode="cover"
      />

      <View style={styles.infoContainer}>
        <Text style={styles.direccion}>{direccion}</Text>
        <Text style={styles.precio}>€ {precio}</Text>

        <Text style={styles.subtitulo}>ACEPTADOS</Text>
        {aceptados.map(({ punto }, index) => (
          <View key={`a-${index}`} style={styles.puntoRow}>
            <Ionicons name="person-circle" size={24} color={colors.lightGreyrows} />
            <Text style={styles.puntoText}>{punto.idCliente} - {punto.direccion}</Text>
            <TouchableOpacity>
              <Text style={styles.qr}>Escanear QR</Text>
            </TouchableOpacity>
          </View>
        ))}

        <Text style={styles.subtitulo}>PENDIENTES</Text>
        {pendientes.map(({ punto }, index) => (
          <View key={`p-${index}`} style={styles.puntoRow}>
            <Ionicons name="person-circle" size={24} color={colors.lightGreyrows} />
            <Text style={styles.puntoText}>{punto.idCliente} - {punto.direccion}</Text>
            <View style={styles.botonesPendiente}>
              <TouchableOpacity style={styles.btn}><Text style={styles.btnText}>Aceptar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btn}><Text style={styles.btnText}>Cancelar</Text></TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.empezarViaje}><Text style={styles.btnText}>Empezar viaje</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  mapImage: { width: '100%', height: 300, backgroundColor: colors.lightGrey },
  infoContainer: { padding: 20 },
  direccion: { fontSize: 18, fontWeight: 'bold', color: colors.black },
  precio: { fontSize: 16, color: colors.grey, marginBottom: 10 },
  subtitulo: { fontSize: 14, color: colors.lightGreyrows, marginTop: 20 },
  puntoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  puntoText: { flex: 1, marginLeft: 10, color: colors.black },
  qr: { color: colors.blue, fontWeight: 'bold' },
  botonesPendiente: { flexDirection: 'row', gap: 10 },
  btn: {
    borderWidth: 1,
    borderColor: colors.blue,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  btnText: { color: colors.blue, fontWeight: 'bold' },
  empezarViaje: {
    borderWidth: 1,
    borderColor: colors.blue,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 30,
  },
});
