import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Alert,
  ScrollView,
} from "react-native";
import colors from "@/styles/Colors";
import { ArrowRight, LogOutIcon, StarIcon } from "@/components/Icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../../context/authContext/AuthContext";

export default function Ajustes() {
  const router = useRouter();
  const { logout, updateUserRole, userName, profilePhotoURL, userRole } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const navigateToEdit = () => router.push("./perfil/editarPerfil");
  const navigateToChat = () => router.push("./perfil/chat");
  const navigateToAuto = () => router.push("./perfil/editarAuto");
  const navigateTosoporte = () => router.push("./perfil/soporte");
  const navigateTotyc = () => router.push("./perfil/terminos-y-condiciones");

  const handleLogout = async () => {
    setIsModalVisible(false);
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  const handleSetUserRoleUsuario = () => {
    Alert.alert(
      "Confirmar cambio",
      "¿Estás seguro de que quieres cambiar tu rol a Conductor?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, cambiar",
          onPress: async () => {
            try {
              await updateUserRole("Conductor");
              router.replace("/conductor");
            } catch (error) {
              Alert.alert("Error", "No se pudo actualizar el rol. Intenta nuevamente.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: profilePhotoURL || "https://via.placeholder.com/100" }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>
          {userName ? userName.charAt(0).toUpperCase() + userName.slice(1) : ""}
        </Text>
        <Text style={styles.profileRole}>{userRole || "Conductor"}</Text>
        
      </View>

      <TouchableOpacity style={styles.option} onPress={handleSetUserRoleUsuario}>
        <Text style={styles.optionText}>Quiero ser Conductor</Text>
        <ArrowRight color={colors.lightGreyrows} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.option} onPress={navigateToChat}>
        <Text style={styles.optionText}>ChatBot</Text>
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
        <Text style={styles.optionText}>Términos y Condiciones</Text>
        <ArrowRight color={colors.lightGreyrows} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.option} onPress={() => setIsModalVisible(true)}>
        <Text style={styles.optionText}>Cerrar sesión</Text>
        <LogOutIcon color={colors.lightGreyrows} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
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
              <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={handleLogout}>
                <Text style={styles.modalButtonText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "space-between",
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 120,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 35,
    backgroundColor: colors.lightBlue,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: colors.lightGrey,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.black,
    marginBottom: 5,
  },
  profileRole: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 15,
  },
  option: {
    flexDirection: "row",
    alignContent: "center",
    justifyContent: "space-between",
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
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    padding: 26,
    backgroundColor: colors.white,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.black,
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: colors.grey,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    width: "45%",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
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
    fontWeight: "600",
  },
  modalButtonTextCancel: {
    color: colors.blue,
    fontSize: 16,
    fontWeight: "600",
  },
});
