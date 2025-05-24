import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal } from 'react-native';
import colors from "@/styles/Colors";  // Asegúrate de tener un archivo de colores
import { ArrowRight, LogOutIcon, StarIcon } from '@/components/Icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/authContext/AuthContext';  // Importar el contexto

export default function Ajustes() {

  const router = useRouter();
  const { logout } = useAuth(); // Usando el logout desde el contexto
  const [isModalVisible, setIsModalVisible] = useState(false); // Estado para controlar la visibilidad del modal
  const { userName ,profilePhotoURL} = useAuth(); // Obtener el nombre del usuario logueado
 
  const navigateToEdit = () => {
    router.push('./perfil/editarPerfil');
  };

  const navigateTosoporte = () => {
    router.push('./perfil/soporte');
  };

  const navigateTotyc = () => {
    router.push('./perfil/terminos-y-condiciones');
  };

  const handleLogout = async () => {
    setIsModalVisible(false); // Cierra el modal al confirmar el cierre de sesión
    try {
      await logout(); // Llama a la función logout desde el contexto
      router.push('/'); // Redirige a la pantalla principal
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  return (
    <View style={styles.container}>

      {/* Imagen de perfil y texto debajo */}
      <View style={styles.profileContainer}>
        <Image
          source={{uri: profilePhotoURL || 'https://via.placeholder.com/100'}} // Imagen de perfil, usa una imagen por defecto si no hay URL
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{userName ? userName.charAt(0).toUpperCase() + userName.slice(1) : ''}</Text>
        <Text style={styles.profileRole}>Conductor</Text>
        <View style={styles.starsContainer }>
          <StarIcon color={colors.blue} />
          <Text style={{ marginLeft: 10 }}>5.00</Text>
        </View>
      </View>

      {/* Opciones */}
      <TouchableOpacity style={styles.option}>
        <Text style={styles.optionText}>Quiero ser Usuario</Text>
        <ArrowRight color={colors.lightGreyrows} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={navigateToEdit}>
        <Text style={styles.optionText}>Editar perfil</Text>
        <ArrowRight color={colors.lightGreyrows} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={navigateTosoporte}>
        <Text style={styles.optionText}>Soporte</Text>
        <ArrowRight color={colors.lightGreyrows} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={navigateTotyc}>
        <Text style={styles.optionText}>Terminos y Condiciones</Text>
        <ArrowRight color={colors.lightGreyrows} />
      </TouchableOpacity>

      {/* Botón Cerrar sesión */}
      <TouchableOpacity style={styles.option} onPress={() => setIsModalVisible(true)}>
        <Text style={styles.optionText}>Cerrar sesión</Text>
        <LogOutIcon color={colors.lightGreyrows} />
      </TouchableOpacity>

      {/* Modal de Confirmación */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Cerrar Sesión</Text>
            <Text style={styles.modalMessage}>¿Estás seguro de que quieres cerrar tu sesión?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleLogout}
              >
                <Text style={styles.modalButtonText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  starsContainer: { 
    flexDirection: 'row',  // Alinea los elementos en fila
    alignItems: 'center',  // Centra verticalmente
    marginBottom: 10,
    justifyContent: 'space-between',
  },

  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  header: {
    fontSize: 28,
    fontWeight: "600",
    color: colors.black,
    marginBottom: 30,
    textAlign: 'center',  // Centrado del encabezado
  },
  profileContainer: {
    alignItems: 'center',  // Centra el contenido en el eje horizontal
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 35,  // Hace que la imagen sea circular
    backgroundColor: colors.lightBlue,
    marginBottom: 10, 
    borderWidth:2,
    borderColor:colors.lightGrey // Espacio entre la imagen y los textos
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 5,
  },
  profileRole: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 15,
  },
  editButton: {
    backgroundColor: colors.blue,
    borderRadius: 20,
    padding: 10,
  },
  editButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  option: {
    flexDirection: 'row',   
    alignContent: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderBottomColor: colors.lightGrey100,
    borderBottomWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  optionText: {
    fontSize: 16,
    color: colors.black,
    fontWeight: '500',
  },

  /* Estilos del Modal */
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    borderRadius: 10,
  },
  confirmButton: {
    backgroundColor: colors.blue,
    borderRadius: 10,

  },
  modalButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextCancel:
  {
    color: colors.blue,
    fontSize: 16,
    fontWeight: '600',
  },
});

