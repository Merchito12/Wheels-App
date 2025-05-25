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
import colors from '@/styles/Colors';
import {  CameraIcon } from '@/components/Icons';

export interface ProfileData {
  name: string;
  profilePhotoURL: string;
}

export interface ProfileEditorProps {
  initialData: ProfileData;
  onCancel: () => void;
  onSave: (data: ProfileData) => Promise<void>;
}

export default function ProfileEditor({ initialData, onCancel, onSave }: ProfileEditorProps) {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>(initialData);
  const [modalVisible, setModalVisible] = useState(false);

  const pickImageFromGallery = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert('Permiso denegado', 'Necesito permiso para acceder a la galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setProfileData(prev => ({ ...prev, profilePhotoURL: result.assets[0].uri }));
    }
  };

  const takePhotoWithCamera = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert('Permiso denegado', 'Necesito permiso para usar la cámara.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setProfileData(prev => ({ ...prev, profilePhotoURL: result.assets[0].uri }));
    }
  };

  const showPhotoOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Seleccionar de la Galería', 'Tomar Foto'],
          cancelButtonIndex: 0,
        },
        idx => {
          if (idx === 1) pickImageFromGallery();
          else if (idx === 2) takePhotoWithCamera();
        }
      );
    } else {
      setModalVisible(true);
    }
  };

  const handleSave = async () => {
    if (!profileData.name.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    setLoading(true);
    try {
      await onSave({
        name: profileData.name.trim(),
        profilePhotoURL: profileData.profilePhotoURL,
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
     

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <TouchableOpacity onPress={showPhotoOptions}>
              <Image
                source={{ uri: profileData.profilePhotoURL || 'https://via.placeholder.com/120' }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.editImageButton} onPress={showPhotoOptions}>
              <CameraIcon color={colors.white} size={16} />
            </TouchableOpacity>
          </View>
          <Text style={styles.changePhotoText}>Toca la foto para cambiarla</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nombre completo</Text>
            <TextInput
              style={styles.textInput}
              value={profileData.name}
              onChangeText={text => setProfileData(prev => ({ ...prev, name: text }))}
              placeholder="Ingresa tu nombre completo"
              placeholderTextColor={colors.grey}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>Guardar Cambios</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {Platform.OS === 'android' && (
        <Modal transparent visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => { pickImageFromGallery(); setModalVisible(false); }}
            >
              <Text style={styles.modalOptionText}>Seleccionar de la Galería</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => { takePhotoWithCamera(); setModalVisible(false); }}
            >
              <Text style={styles.modalOptionText}>Tomar Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalOption, { borderTopWidth: 1, borderColor: '#ccc' }]} onPress={() => setModalVisible(false)}>
              <Text style={[styles.modalOptionText, { color: 'red' }]}>Cancelar</Text>
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
  profileSection: { alignItems: 'center', paddingVertical: 30 },
  profileImageContainer: { position: 'relative', marginBottom: 10 },
  profileImage: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: colors.lightGrey,
    borderWidth: 2, borderColor: colors.blue,
  },
  editImageButton: {
    position: 'absolute', bottom: 5, right: 5,
    backgroundColor: colors.blue, borderRadius: 15,
    width: 30, height: 30, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.white,
  },
  changePhotoText: { fontSize: 14, color: colors.darkGrey, fontWeight: '400' },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.black, marginBottom: 20 },
  inputContainer: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '500', color: colors.darkGrey, marginBottom: 8 },
  textInput: {
    borderWidth: 1, borderColor: colors.lightGrey100, borderRadius: 10,
    paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: colors.black,
    backgroundColor: colors.white,
  },
  saveButton: {
    backgroundColor: colors.blue, borderRadius: 10,
    paddingVertical: 15, alignItems: 'center', marginTop: 20, marginBottom: 40,
  },
  disabledButton: { opacity: 0.6 },
  saveButtonText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: {
    position: 'absolute', bottom: 0, width: '100%', backgroundColor: colors.white,
    borderTopLeftRadius: 12, borderTopRightRadius: 12, paddingBottom: 20,
  },
  modalOption: { paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderColor: '#eee' },
  modalOptionText: { fontSize: 18, color: colors.black, textAlign: 'center' },
});
