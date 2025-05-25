// src/screens/EditarVehiculoScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ActionSheetIOS } from 'react-native';
import { useAuth } from '@/context/authContext/AuthContext';
import { useRouter } from 'expo-router';
import colors from '@/styles/Colors';
import { CameraIcon } from '@/components/Icons';

export interface VehicleData {
  plate: string;
  brand: string;
  color: string;
  seats: string; // usar string para TextInput
  photoURL: string;
}

export default function EditarVehiculoScreen() {
  const router = useRouter();
  const { car, updateProfile } = useAuth();

  const [vehicleData, setVehicleData] = useState<VehicleData>({
    plate: car?.plate || '',
    brand: car?.brand || '',
    color: car?.color || '',
    seats: String(car?.seats || 4),
    photoURL: car?.photoURL || '',
  });
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const pickImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert('Permiso denegado', 'Necesito permiso para acceder a la galería.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]) {
      setVehicleData(prev => ({ ...prev, photoURL: res.assets[0].uri }));
    }
  };

  const takePhoto = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert('Permiso denegado', 'Necesito permiso para usar la cámara.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]) {
      setVehicleData(prev => ({ ...prev, photoURL: res.assets[0].uri }));
    }
  };

  const showPhotoOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancelar', 'Galería', 'Cámara'], cancelButtonIndex: 0 },
        idx => {
          if (idx === 1) pickImage();
          else if (idx === 2) takePhoto();
        }
      );
    } else {
      setModalVisible(true);
    }
  };

  const handleSave = async () => {
    if (
      !vehicleData.plate.trim() ||
      !vehicleData.brand.trim() ||
      !vehicleData.color.trim() ||
      isNaN(Number(vehicleData.seats)) ||
      Number(vehicleData.seats) < 1
    ) {
      Alert.alert('Error', 'Por favor completa todos los campos correctamente.');
      return;
    }
    setLoading(true);
    try {
      await updateProfile({
        car: {
          plate: vehicleData.plate.toUpperCase(),
          brand: vehicleData.brand,
          color: vehicleData.color,
          seats: Number(vehicleData.seats),
          photoURL: vehicleData.photoURL,
        },
      });
      router.back();
    } catch (e) {
      Alert.alert('Error', 'No se pudo actualizar el vehículo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      
      

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Foto del vehículo */}
        <View style={styles.photoSection}>
          <TouchableOpacity style={styles.photoContainer} onPress={showPhotoOptions}>
            <Image
              source={{ uri: vehicleData.photoURL || 'https://via.placeholder.com/150x90' }}
              style={styles.photo}
            />
            <View style={styles.editButton}>
              <CameraIcon color={colors.white} size={16} />
            </View>
          </TouchableOpacity>
          <Text style={styles.photoText}>Toca para cambiar foto</Text>
        </View>

        {/* Campos de texto */}
        <View style={styles.section}>
          <Text style={styles.label}>Placa</Text>
          <TextInput
            style={styles.input}
            value={vehicleData.plate}
            onChangeText={text => setVehicleData(prev => ({ ...prev, plate: text }))}
            placeholder="ABC-123"
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Marca</Text>
          <TextInput
            style={styles.input}
            value={vehicleData.brand}
            onChangeText={text => setVehicleData(prev => ({ ...prev, brand: text }))}
            placeholder="Toyota, Honda..."
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Color</Text>
          <TextInput
            style={styles.input}
            value={vehicleData.color}
            onChangeText={text => setVehicleData(prev => ({ ...prev, color: text }))}
            placeholder="Blanco, Negro..."
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Número de asientos</Text>
          <TextInput
            style={styles.input}
            value={vehicleData.seats}
            onChangeText={text => setVehicleData(prev => ({ ...prev, seats: text }))}
            placeholder="4"
            keyboardType="numeric"
          />
        </View>

        {/* Botón guardar */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveText}>Guardar Cambios</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Android */}
      {Platform.OS === 'android' && (
        <Modal transparent visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.modalOption} onPress={() => { pickImage(); setModalVisible(false); }}>
              <Text style={styles.modalText}>Galería</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => { takePhoto(); setModalVisible(false); }}>
              <Text style={styles.modalText}>Cámara</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalOption, { borderTopWidth: 1, borderColor: '#ccc' }]} onPress={() => setModalVisible(false)}>
              <Text style={[styles.modalText, { color: 'red' }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.lightGrey100,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: colors.black },
  placeholder: { width: 40 },
  scrollContainer: { flex: 1, paddingHorizontal: 20 },
  photoSection: { alignItems: 'center', marginVertical: 20 },
  photoContainer: { position: 'relative' },
  photo: {
    width: 150, height: 90, borderRadius: 8,
    backgroundColor: colors.lightGrey, borderWidth: 1, borderColor: colors.lightGrey100,
  },
  editButton: {
    position: 'absolute', bottom: -5, right: -5,
    backgroundColor: colors.blue, borderRadius: 15,
    width: 30, height: 30, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.white,
  },
  photoText: { fontSize: 14, color: colors.darkGrey, marginTop: 8 },
  section: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', color: colors.darkGrey, marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: colors.lightGrey100, borderRadius: 10,
    paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: colors.black,
    backgroundColor: colors.white,
  },
  saveButton: {
    backgroundColor: colors.blue, borderRadius: 10,
    paddingVertical: 15, alignItems: 'center', marginVertical: 30,
  },
  disabled: { opacity: 0.6 },
  saveText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: {
    position: 'absolute', bottom: 0, width: '100%',
    backgroundColor: colors.white, borderTopLeftRadius: 12, borderTopRightRadius: 12,
    paddingBottom: 20,
  },
  modalOption: { paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderColor: '#eee' },
  modalText: { fontSize: 18, color: colors.black, textAlign: 'center' },
});
