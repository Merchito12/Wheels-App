import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import colors from '@/styles/Colors';
import { Punto, useViajes } from '@/context/viajeContext/ViajeConductorContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useViajeSeleccionado } from '@/context/viajeContext/ViajeSeleccionadoContext';

import { doc, getDoc } from "firebase/firestore";
import { db } from "../../utils/FirebaseConfig";  // Ajusta la ruta según tu proyecto
import MapComponent from '@/components/shared/Map';


export default function ViajeDetalleScreen() {
  const { viaje } = useViajeSeleccionado();
  const {
    obtenerPuntosPorEstado,
    actualizarEstadoPunto,
    actualizarEstadoViaje,
  } = useViajes();

  const [aceptados, setAceptados] = useState<
    { viajeId: string; viajeDireccion: string; punto: Punto }[]
  >([]);
  const [pendientes, setPendientes] = useState<
    { viajeId: string; viajeDireccion: string; punto: Punto }[]
  >([]);
  const [negados, setNegados] = useState<
    { viajeId: string; viajeDireccion: string; punto: Punto }[]
  >([]);

  const [nombresClientes, setNombresClientes] = useState<Record<string, string>>({});
const [fotosClientes, setFotosClientes] = useState<Record<string, string>>({});


  const [modalConfirmarVisible, setModalConfirmarVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function cargarPuntos() {
      if (!viaje) return;

      const aceptadosData = await obtenerPuntosPorEstado('aceptado');
      const pendientesData = await obtenerPuntosPorEstado('pendiente');
      const negadosData = await obtenerPuntosPorEstado('negado');

      setAceptados(aceptadosData.filter((p) => p.viajeId === viaje.id));
      setPendientes(pendientesData.filter((p) => p.viajeId === viaje.id));
      setNegados(negadosData.filter((p) => p.viajeId === viaje.id));
    }
    cargarPuntos();
  }, [viaje]);


  const cargarDatosCliente = async (idCliente: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", idCliente));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          nombre: data.name || "Sin nombre",
          foto: data.profilePhotoURL || "",
        };
      }
    } catch (error) {
      console.error(`Error al obtener datos de cliente ${idCliente}:`, error);
    }
    return { nombre: idCliente, foto: "" };
  };
  useEffect(() => {
    const cargarDatosClientes = async () => {
      const todosIds = new Set<string>();
      aceptados.forEach(({ punto }) => todosIds.add(punto.idCliente));
      pendientes.forEach(({ punto }) => todosIds.add(punto.idCliente));
      negados.forEach(({ punto }) => todosIds.add(punto.idCliente));
  
      const nuevosNombres: Record<string, string> = {};
      const nuevasFotos: Record<string, string> = {};
  
      for (const id of todosIds) {
        if (!nombresClientes[id] || !fotosClientes[id]) {
          const { nombre, foto } = await cargarDatosCliente(id);
          nuevosNombres[id] = nombre;
          nuevasFotos[id] = foto;
        }
      }
  
      if (Object.keys(nuevosNombres).length > 0) {
        setNombresClientes(prev => ({ ...prev, ...nuevosNombres }));
      }
      if (Object.keys(nuevasFotos).length > 0) {
        setFotosClientes(prev => ({ ...prev, ...nuevasFotos }));
      }
    };
  
    cargarDatosClientes();
  }, [aceptados, pendientes, negados]);
    

  const manejarAceptar = async (punto: Punto) => {
    try {
      await actualizarEstadoPunto(viaje!.id, punto.idCliente, 'aceptado');
      setPendientes((prev) => prev.filter((p) => p.punto.idCliente !== punto.idCliente));
      setAceptados((prev) => [...prev, { viajeId: viaje!.id, viajeDireccion: viaje!.direccion || '', punto }]);
    } catch (error) {
      console.error('Error aceptando punto:', error);
      Alert.alert('Error', 'No se pudo aceptar el punto.');
    }
  };

  const manejarNegar = async (punto: Punto) => {
    try {
      await actualizarEstadoPunto(viaje!.id, punto.idCliente, 'negado');
      setPendientes((prev) => prev.filter((p) => p.punto.idCliente !== punto.idCliente));
      setNegados((prev) => [...prev, { viajeId: viaje!.id, viajeDireccion: viaje!.direccion || '', punto }]);
    } catch (error) {
      console.error('Error negando punto:', error);
      Alert.alert('Error', 'No se pudo negar el punto.');
    }
  };

  const confirmarInicioViaje = () => {
    setModalConfirmarVisible(true);
  };

  const iniciarViaje = async () => {
    if (!viaje) return;

    if (viaje.estado === 'en curso') {
      Alert.alert('El viaje ya está en curso.');
      setModalConfirmarVisible(false);
      return;
    }

    setLoading(true);
    try {
      await actualizarEstadoViaje(viaje.id, 'en curso');
      // Simular loader por 2 segundos
      setTimeout(() => {
        setLoading(false);
        setModalConfirmarVisible(false);
        router.push('/detallesViaje/EnCursoConductor');
      }, 2000);
    } catch (error) {
      console.error('Error iniciando viaje:', error);
      Alert.alert('Error', 'No se pudo iniciar el viaje.');
      setLoading(false);
      setModalConfirmarVisible(false);
    }
  };

  if (!viaje) {
    return (
      <View style={styles.center}>
        <Text>No hay ningún viaje seleccionado.</Text>
      </View>
    );
  }

  return (
    <>
      {/* HEADER FIJO ARRIBA */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={colors.blue} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            {viaje.haciaLaU ? 'Desde La Universidad' : 'Desde ' + viaje.direccion}
          </Text>
          <Text style={styles.headerSubtitle}>
            Estado: <Text style={{ fontWeight: 'bold' }}>{viaje.estado}</Text>
          </Text>
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: 90 }}>
        {/* Imagen del mapa del viaje */}
<MapComponent viaje={{ ...viaje, direccion: viaje.direccion || '' }} puntosAceptados={aceptados.map(item => item.punto)} />

        <View style={styles.infoContainer}>

          {/* Información adicional del viaje con íconos */}
          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={20} color={colors.grey} />
            <Text style={styles.infoText}>
              Precio: {typeof viaje.precio === 'number' ? `$${viaje.precio}` : viaje.precio || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={colors.grey} />
            <Text style={styles.infoText}>Fecha: {viaje.fecha || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color={colors.grey} />
            <Text style={styles.infoText}>Hora: {viaje.horaSalida || 'N/A'}</Text>
          </View>
          

          <TouchableOpacity
            style={[
              styles.iniciarButton,
              viaje.estado === 'en curso' && styles.iniciarButtonDisabled,
            ]}
            onPress={confirmarInicioViaje}
            disabled={viaje.estado === 'en curso'}
          >
            <Text style={styles.iniciarButtonText}>
              {viaje.estado === 'en curso' ? 'Viaje en Curso' : 'Iniciar Viaje'}
            </Text>
          </TouchableOpacity>

          {aceptados.length > 0 && (
  <>
    <Text style={styles.subtitulo}>Puntos Aceptados</Text>
    {aceptados.map(({ punto }, index) => (
      <View key={`a-${index}`} style={[styles.puntoRow, styles.cardPunto]}>
        {fotosClientes[punto.idCliente] ? (
          <Image
            source={{ uri: fotosClientes[punto.idCliente] }}
            style={styles.userImage}
          />
        ) : (
          <Ionicons name="person-circle" size={36} color={colors.lightGreyrows} />
        )}
        <View style={styles.puntoInfo}>
          <Text style={styles.puntoNombre}>{punto.direccion}</Text>
          <Text style={styles.puntoDireccion}>
            {nombresClientes[punto.idCliente] || punto.idCliente}
          </Text>
        </View>
      </View>
    ))}
  </>
)}


          {pendientes.length > 0 && (
            <>
              <Text style={styles.subtitulo}>Pendientes</Text>
              {pendientes.map(({ punto }, index) => (
                <View key={`p-${index}`} style={styles.puntoRow}>
                  <Ionicons
                    name="person-circle-outline"
                    size={36}
                    color={colors.grey}
                  />
                  <View style={styles.puntoInfo}>
                    <Text style={styles.puntoDireccion}>{punto.direccion}</Text>
                  </View>
                  <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                      style={[styles.button, styles.acceptButton]}
                      onPress={() => manejarAceptar(punto)}
                    >
                      <Text style={styles.buttonText}>Aceptar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.cancelButton]}
                      onPress={() => manejarNegar(punto)}
                    >
                      <Text style={[styles.buttonText, { color: colors.blue }]}>Negar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          )}

          {negados.length > 0 && (
            <>
              <Text style={styles.subtitulo}>Negados</Text>
              {negados.map(({ punto }, index) => (
                <View key={`n-${index}`} style={styles.puntoRow}>
                  <Ionicons
                    name="person-circle"
                    size={36}
                    color={colors.grey}
                  />
                  <View style={styles.puntoInfo}>
                    <Text style={styles.puntoNombre}>{punto.idCliente}</Text>
                    <Text style={styles.puntoDireccion}>{punto.direccion}</Text>
                  </View>
                </View>
              ))}
            </>
          )}

          {aceptados.length === 0 && pendientes.length === 0 && negados.length === 0 && (
            <Text style={{ color: colors.grey, fontStyle: 'italic' }}>
              No hay pasajeros por recoger, pendientes o negados.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Modal de Confirmación */}
      <Modal
        visible={modalConfirmarVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!loading) setModalConfirmarVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {loading ? (
              <>
                <ActivityIndicator size="large" color={colors.blue} />
                <Text style={{ marginTop: 15 }}>Iniciando viaje...</Text>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Confirmar Inicio de Viaje</Text>
                <Text style={styles.modalMessage}>¿Estás seguro de iniciar este viaje?</Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalConfirmarVisible(false)}
                  >
                    <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={iniciarViaje}
                  >
                    <Text style={styles.modalButtonText}>Aceptar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    width: '100%',
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 9999,
    paddingTop: 90,
    paddingBottom: 30,
  },
  backButton: {
    marginRight: 10,
    padding: 5,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: colors.black,
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerSubtitle: {
    color: colors.blue,
    fontSize: 12,
    marginTop: 2,
    opacity: 0.85,
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  mapImage: {
    width: '100%',
    height: 300,
    backgroundColor: colors.lightGrey,
  },
  infoContainer: {
    padding: 20,
    paddingBottom: 100, // Espacio para el botón de iniciar viaje
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.grey,
  },
  subtitulo: {
    fontSize: 18,
    color: colors.grey,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
  },
  puntoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  puntoInfo: {
    flex: 1,
    marginLeft: 10,
  },
  puntoNombre: {
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.black,
  },
  puntoDireccion: {
    fontSize: 14,
    color: colors.grey,
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginLeft: 8,
    borderWidth: 1,
  },
  acceptButton: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  cancelButton: {
    backgroundColor: colors.white,
    borderColor: colors.blue,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  iniciarButton: {
    backgroundColor: colors.blue,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  iniciarButtonDisabled: {
    backgroundColor: colors.grey,
  },
  iniciarButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Transparente para modal
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    padding: 26,
    backgroundColor: colors.white,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: colors.grey,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    width: '45%',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },

  confirmButton: {
    backgroundColor: colors.blue,
  },
  modalButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextCancel: {
    color: colors.blue,
    fontSize: 16,
    fontWeight: '600',
  },
    userImage: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
    },
    cardPunto: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 15,
        marginVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        // sombra para iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        // sombra para Android
        elevation: 3,
      },
      center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: 20,
      },
      
});