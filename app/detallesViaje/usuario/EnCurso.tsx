import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import colors from '@/styles/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCliente, Viaje } from '../../../context/viajeContext/viajeClienteContext';
import { useAuth } from '../../../context/authContext/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../utils/FirebaseConfig';

export default function ViajeDetalleScreen() {
  const { user } = useAuth();
  const { obtenerViajesPorEstadoViajeYEstadoPunto } = useCliente();
  const router = useRouter();

  const [viajeEnCurso, setViajeEnCurso] = useState<Viaje | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalQRVisible, setModalQRVisible] = useState(false);
  const [fotosClientes, setFotosClientes] = useState<Record<string, string>>({});
  const [fotoCarroConductor, setFotoCarroConductor] = useState<string | null>(null);

  // Obtener foto perfil cliente por idCliente (pasajeros)
  const obtenerFotoCliente = async (idCliente: string): Promise<string | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', idCliente));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return data.profilePhotoURL || null;
      }
    } catch (error) {
      console.error(`Error obteniendo foto de cliente ${idCliente}:`, error);
    }
    return null;
  };

  // Obtener foto carro conductor por uid
  const obtenerFotoCarroConductor = async (uid: string): Promise<string | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return data.car?.photoURL || null;
      }
    } catch (error) {
      console.error(`Error obteniendo foto de carro del conductor ${uid}:`, error);
    }
    return null;
  };

  useEffect(() => {
    async function cargarViajeEnCurso() {
      if (!user) {
        setViajeEnCurso(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const viajes = await obtenerViajesPorEstadoViajeYEstadoPunto('en curso', 'aceptado');
        const viajeFiltrado = viajes.find(v =>
          v.puntos.some(p => p.idCliente === user.uid)
        );
        setViajeEnCurso(viajeFiltrado || null);
      } catch (error) {
        console.error('Error al cargar viaje en curso:', error);
        setViajeEnCurso(null);
      } finally {
        setLoading(false);
      }
    }
    cargarViajeEnCurso();
  }, [user, obtenerViajesPorEstadoViajeYEstadoPunto]);

  // Cargar fotos pasajeros
  useEffect(() => {
    async function cargarFotosClientes() {
      if (!viajeEnCurso) return;
      const nuevasFotosClientes: Record<string, string> = {};
      for (const punto of viajeEnCurso.puntos) {
        if (!fotosClientes[punto.idCliente]) {
          const urlCliente = await obtenerFotoCliente(punto.idCliente);
          if (urlCliente) nuevasFotosClientes[punto.idCliente] = urlCliente;
        }
      }
      if (Object.keys(nuevasFotosClientes).length > 0) {
        setFotosClientes(prev => ({ ...prev, ...nuevasFotosClientes }));
      }
    }
    cargarFotosClientes();
  }, [viajeEnCurso]);

  // Cargar foto carro del conductor que creó el viaje
  useEffect(() => {
    async function cargarFotoCarro() {
      if (!viajeEnCurso) return;
      if (!viajeEnCurso.idConductor) return; // ajusta según tu modelo si es otro campo
      const foto = await obtenerFotoCarroConductor(viajeEnCurso.idConductor);
      setFotoCarroConductor(foto);
    }
    cargarFotoCarro();
  }, [viajeEnCurso]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Cargando viaje en curso...</Text>
      </View>
    );
  }

  if (!viajeEnCurso) {
    return (
      <View style={styles.center}>
        <Text>No hay ningún viaje en curso o por iniciar para ti.</Text>
      </View>
    );
  }

  const puntosAceptados = viajeEnCurso.puntos.filter(p => p.estado === 'aceptado');
  const miPunto = puntosAceptados.find(p => p.idCliente === user?.uid) || null;
  const otrosPuntos = puntosAceptados.filter(p => p.idCliente !== user?.uid);

  return (
    <>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/usuario')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={colors.blue} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{viajeEnCurso.direccion}</Text>
          <Text style={styles.headerSubtitle}>
            Estado: <Text style={{ fontWeight: 'bold' }}>{viajeEnCurso.estado}</Text>
          </Text>
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: 90 }}>
        {/* FOTO ESTÁTICA DEL MAPA */}
        <Image
          source={require('@/assets/images/map.png')}
          style={styles.mapImage}
          resizeMode="cover"
        />

        {/* INFORMACIÓN DEL VIAJE */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={20} color={colors.grey} />
            <Text style={styles.infoText}>
              Precio: {typeof viajeEnCurso.precio === 'number' ? `$${viajeEnCurso.precio}` : viajeEnCurso.precio || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={colors.grey} />
            <Text style={styles.infoText}>Fecha: {viajeEnCurso.fecha || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color={colors.grey} />
            <Text style={styles.infoText}>Hora: {viajeEnCurso.horaSalida || 'N/A'}</Text>
          </View>

          {/* FOTO DEL CARRO DEL CONDUCTOR */}
          <View style={styles.carImageContainer}>
            {/* {fotoCarroConductor ? (
              <Image
                source={{ uri: fotoCarroConductor }}
                style={styles.carImage}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="car" size={60} color={colors.blue} />
            )} */}
          </View>
        </View>

        {/* TU PUNTO */}
        {miPunto && (
          <>
          <View style={styles.listConatainer}>
            <Text style={styles.subtitulo}>Tu Punto</Text>
            <View style={styles.card}>
              {fotosClientes[miPunto.idCliente] ? (
                <Image
                  source={{ uri: fotosClientes[miPunto.idCliente] }}
                  style={styles.userImage}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="person-circle" size={40} color={colors.blue} />
              )}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{miPunto.direccion}</Text>
                <Text style={styles.cardEstado}>Estado: {miPunto.estado}</Text>
              </View>
              <TouchableOpacity
                style={styles.qrIconContainer}
                onPress={() => setModalQRVisible(true)}
              >
                <Ionicons name="qr-code-outline" size={30} color={colors.blue} />
              </TouchableOpacity>
            </View>
            </View>

          </>
        )}

        {/* OTROS PUNTOS */}
        <View style={styles.listConatainer}>
        <Text style={styles.subtitulo}>Otros Puntos Aceptados</Text>
        {otrosPuntos.length === 0 ? (
          <Text style={{ color: colors.grey, fontStyle: 'italic' }}>
            No hay otros puntos aceptados.
          </Text>
        ) : (
          otrosPuntos.map((punto, index) => (
            <View key={index} style={[styles.card, styles.cardGris]}>
              {fotosClientes[punto.idCliente] ? (
                <Image
                  source={{ uri: fotosClientes[punto.idCliente] }}
                  style={styles.userImage}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="person-circle" size={40} color={colors.blue} />
              )}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{punto.direccion}</Text>
                <Text style={styles.cardEstado}>Estado: {punto.estado}</Text>
              </View>
            </View>

          ))
        )}
                </View>

        
      </ScrollView>

      {/* Modal QR */}
      <Modal
        visible={modalQRVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalQRVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Image
              source={require('@/assets/images/qr_example.png')}
              style={styles.qrImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalQRVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
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
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
    color: colors.black,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.lightBlue,
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
  },
  cardGris: {
    backgroundColor: colors.lightGrey,
  },
  cardContent: {
    marginLeft: 15,
    flex: 1,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.black,
  },
  cardEstado: {
    fontSize: 12,
    color: colors.darkGrey,
    marginTop: 6,
    fontStyle: 'italic',
  },
  qrIconContainer: {
    marginLeft: 15,
    padding: 6,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  carImageContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  carImage: {
    width: 200,
    height: 120,
    borderRadius: 10,
  },
  qrImage: {
    width: 250,
    height: 250,
    marginBottom: 20,
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
  modalCloseButton: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderWidth: 1,
    borderColor: colors.blue,
    borderRadius: 10,
  },
  modalCloseButtonText: {
    color: colors.blue,
    fontWeight: 'bold',
    fontSize: 16,
  },
  listConatainer: {
    paddingHorizontal: 20,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
