import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Button,
} from 'react-native';
import colors from '@/styles/Colors';
import { Punto, useViajes } from '@/context/viajeContext/ViajeConductorContext';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function ViajeDetalleScreen() {
  const {
    viajes,
    obtenerPuntosPorEstado,
    actualizarEstadoViaje,
  } = useViajes();

  const viajeEnCurso = viajes.find(
    (v) => v.estado === 'por iniciar' || v.estado === 'en curso'
  );

  // Guardamos solo los puntos en viaje para el viaje actual
  const [enViaje, setEnViaje] = useState<Punto[]>([]);

  const [aceptados, setAceptados] = useState<
    { viajeId: string; viajeDireccion: string; punto: Punto }[]
  >([]);
  const [pendientes, setPendientes] = useState<
    { viajeId: string; viajeDireccion: string; punto: Punto }[]
  >([]);

  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [puntoActual, setPuntoActual] = useState<
    { idCliente: string; direccion: string } | null
  >(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [modalVerificadoVisible, setModalVerificadoVisible] = useState(false);
  const [modalConfirmarVisible, setModalConfirmarVisible] = useState(false);

  const STORAGE_KEY = 'enViajePorViaje';

  // Cargar puntos aceptados y pendientes para el viaje en curso
  useEffect(() => {
    async function cargarPuntos() {
      if (!viajeEnCurso) return;

      const aceptadosData = await obtenerPuntosPorEstado('aceptado');
      const pendientesData = await obtenerPuntosPorEstado('pendiente');

      setAceptados(aceptadosData.filter((p) => p.viajeId === viajeEnCurso.id));
      setPendientes(pendientesData.filter((p) => p.viajeId === viajeEnCurso.id));
    }
    cargarPuntos();
  }, [viajeEnCurso]);

  // Cargar puntos en viaje solo del viaje actual desde AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const savedDataStr = await AsyncStorage.getItem(STORAGE_KEY);
        const savedData = savedDataStr ? JSON.parse(savedDataStr) : {};
        if (viajeEnCurso && savedData[viajeEnCurso.id]) {
          setEnViaje(savedData[viajeEnCurso.id]);
        } else {
          setEnViaje([]);
        }
      } catch (e) {
        console.error('Error cargando pasajeros en viaje desde AsyncStorage:', e);
      }
    })();
  }, [viajeEnCurso]);

  // Guardar puntos en viaje solo para el viaje actual en AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        if (!viajeEnCurso) return;

        const savedDataStr = await AsyncStorage.getItem(STORAGE_KEY);
        const savedData = savedDataStr ? JSON.parse(savedDataStr) : {};

        savedData[viajeEnCurso.id] = enViaje;

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
      } catch (e) {
        console.error('Error guardando pasajeros en viaje en AsyncStorage:', e);
      }
    })();
  }, [enViaje, viajeEnCurso]);

  const handleScanQR = (punto: { idCliente: string; direccion: string }) => {
    setPuntoActual(punto);
    setScanned(false);
    setModalVisible(true);
  };

  const handleQrScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    setModalVisible(false);
    setModalVerificadoVisible(true);

    if (!puntoActual) return;

    // Remover punto del array aceptados para UI
    setAceptados((prev) =>
      prev.filter((p) => p.punto.idCliente !== puntoActual.idCliente)
    );

    // Agregar punto al estado local de enViaje para el viaje actual
    setEnViaje((prev) => [
      ...prev,
      { ...puntoActual, estado: 'en viaje' } as Punto,
    ]);
  };

  const finalizarViaje = async () => {
    if (!viajeEnCurso) return;
    try {
      await actualizarEstadoViaje(viajeEnCurso.id, 'finalizado');
      setModalConfirmarVisible(false);
      router.push('/conductor');
    } catch (error) {
      console.error('Error finalizando viaje:', error);
      setModalConfirmarVisible(false);
    }
  };

  if (!viajeEnCurso) {
    return (
      <View style={styles.center}>
        <Text>No hay ningún viaje en curso o por iniciar.</Text>
      </View>
    );
  }

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text>Necesitamos permiso para usar la cámara.</Text>
        <Button title="Permitir acceso a la cámara" onPress={requestPermission} />
      </View>
    );
  }

  // Filtrar aceptados para no mostrar los ya en viaje
  const aceptadosFiltrados = aceptados.filter(({ punto }) =>
    !enViaje.some((p) => p.idCliente === punto.idCliente)
  );

  return (
    <>
      {/* HEADER FIJO ARRIBA */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace(
          '/conductor'
        )} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={colors.blue} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            {viajeEnCurso.haciaLaU ? 'Desde La Universidad' : 'Desde ' + viajeEnCurso.direccion}
          </Text>
          <Text style={styles.headerSubtitle}>
            Estado: <Text style={{ fontWeight: 'bold' }}>{viajeEnCurso.estado}</Text>
          </Text>
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: 90 }}>
        <Image
          source={require('@/assets/images/map.png')}
          style={styles.mapImage}
          resizeMode="cover"
        />

        <View style={styles.infoContainer}>
          {aceptadosFiltrados.length > 0 && (
            <>
              <Text style={styles.subtitulo}>Por Recoger</Text>
              {aceptadosFiltrados.map(({ punto }, index) => (
                <View key={`a-${index}`} style={styles.puntoRow}>
                  <Ionicons
                    name="person-circle"
                    size={36}
                    color={colors.lightGreyrows}
                  />
                  <View style={styles.puntoInfo}>
                    <Text style={styles.puntoNombre}>{punto.idCliente}</Text>
                    <Text style={styles.puntoDireccion}>{punto.direccion}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleScanQR(punto)}
                    style={styles.scanContainer}
                  >
                    <Ionicons name="qr-code-outline" size={20} color={colors.blue} />
                    <Text style={styles.qr}>Escanear QR</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}

          {enViaje.length > 0 && (
            <>
              <Text style={styles.subtitulo}>En Viaje</Text>
              {enViaje.map((punto, index) => (
                <View key={`e-${index}`} style={styles.puntoRow}>
                  <Ionicons name="car" size={36} color={colors.blue} />
                  <View style={styles.puntoInfo}>
                    <Text style={styles.puntoNombre}>{punto.idCliente}</Text>
                    <Text style={styles.puntoDireccion}>{punto.direccion}</Text>
                  </View>
                </View>
              ))}
            </>
          )}

          {aceptadosFiltrados.length === 0 && enViaje.length === 0 && (
            <Text style={{ color: colors.grey, fontStyle: 'italic' }}>
              No hay pasajeros por recoger ni en viaje.
            </Text>
          )}

          <TouchableOpacity
            style={styles.finalizarButton}
            onPress={() => setModalConfirmarVisible(true)}
          >
            <Text style={styles.finalizarButtonText}>Finalizar Viaje</Text>
          </TouchableOpacity>
        </View>

        {/* Modal escáner QR */}
        <Modal visible={modalVisible} animationType="slide">
          <View style={styles.container}>
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={handleQrScanned}
            />
            {scanned && (
              <View style={{ position: 'absolute', bottom: 80 }}>
                <Button title="Escanear de nuevo" onPress={() => setScanned(false)} />
              </View>
            )}
            <View style={{ position: 'absolute', top: 50, right: 20 }}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={32} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal de verificación */}
        <Modal
          visible={modalVerificadoVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVerificadoVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>✅ QR escaneado correctamente</Text>
              <Button title="Cerrar" onPress={() => setModalVerificadoVisible(false)} />
            </View>
          </View>
        </Modal>

        {/* Modal de confirmación Finalizar Viaje */}
        <Modal
          visible={modalConfirmarVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalConfirmarVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Confirmar Finalización</Text>
              <Text style={styles.modalMessage}>
                ¿Seguro que quieres finalizar este viaje?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalConfirmarVisible(false)}
                >
                  <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={finalizarViaje}
                >
                  <Text style={styles.modalButtonText}>Finalizar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
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
  container: { flex: 1, backgroundColor: colors.white },
  mapImage: { width: '100%', height: 300, backgroundColor: colors.lightGrey },
  infoContainer: { padding: 20 },
  direccion: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 6,
  },
  precio: { fontSize: 18, color: colors.grey, marginBottom: 15 },
  subtitulo: {
    fontSize: 14,
    color: colors.lightGreyrows,
    marginTop: 30,
    marginBottom: 10,
  },
  puntoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  puntoInfo: { flex: 1, marginLeft: 10 },
  puntoNombre: { fontWeight: 'bold', fontSize: 16, color: colors.black },
  puntoDireccion: { fontSize: 14, color: colors.grey },
  scanContainer: { flexDirection: 'row', alignItems: 'center' },
  qr: { color: colors.blue, fontWeight: 'bold', fontSize: 14, marginLeft: 6 },
  botonesPendiente: { flexDirection: 'row' },
  btn: {
    borderWidth: 1,
    borderColor: colors.blue,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 10,
  },
  btnText: { color: colors.blue, fontWeight: 'bold' },
  empezarViaje: {
    borderWidth: 1,
    borderColor: colors.blue,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 40,
  },
  finalizarButton: {
    marginTop: 40,
    backgroundColor: colors.white,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.blue,
  },
  finalizarButtonText: {
    color: colors.blue,
    fontSize: 18,
  },
  camera: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

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
  cancelButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.blue,
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
  modalContent: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    color: colors.black,
    marginBottom: 20,
  },
});
