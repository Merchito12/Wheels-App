import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "../../styles/Colors";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../context/authContext/AuthContext";
import { ActionSheetIOS } from "react-native";

interface Car {
  plate: string | null;
  color: string | null;
  brand: string | null;
  seats: number | null;
  photoURL: string | null;
}

const DEFAULT_PROFILE_PHOTO =
  "https://firebasestorage.googleapis.com/v0/b/proyecto-final-dam-85abd.firebasestorage.app/o/profilePhotos%2FdefaultUser.png?alt=media&token=bce581c8-f81d-488b-b236-5f02b8792e8c";

const Loader = () => (
  <View style={styles.loaderContainer}>
    <ActivityIndicator size="large" color={colors.blue} />
    <Text style={styles.loaderText}>Estamos configurando tu perfil...</Text>
  </View>
);

export function Register() {
  const [step, setStep] = useState(0);
  const progress = useState(new Animated.Value(0))[0];
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"Usuario" | "Conductor">("Usuario");
  const [isLoading, setIsLoading] = useState(false);

  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [plate, setPlate] = useState("");
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [seats, setSeats] = useState("");

  const { signUp } = useAuth();

  // Determina cuántos pasos hay: 2 para conductor, 1 para usuario
  const maxStep = role === "Conductor" ? 2 : 1;

  // Funciones de imagen igual que antes...
  const pickProfilePhoto = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return Alert.alert("Permiso denegado", "Necesitas permiso a la galería.");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });
    if (!result.canceled && result.assets.length) {
      setProfilePhoto(result.assets[0].uri);
    }
  };
  const takeProfilePhoto = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) return Alert.alert("Permiso denegado", "Necesitas permiso a la cámara.");
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 4], quality: 1 });
    if (!result.canceled && result.assets.length) {
      setProfilePhoto(result.assets[0].uri);
    }
  };
  const showPhotoOptions = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ["Cancelar","Galería","Cámara"], cancelButtonIndex: 0 },
        i => { if(i===1) pickProfilePhoto(); if(i===2) takeProfilePhoto(); }
      );
    } else {
      setModalVisible(true);
    }
  };
  const handleImagePicker = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return Alert.alert("Permiso denegado", "Necesitas permiso a la galería.");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets.length) {
      setImage(result.assets[0].uri);
      await AsyncStorage.setItem("localCarPhotoUri", result.assets[0].uri);
    }
  };

  // Esta función hace signUp + redirección inmediata según role
  const finalizeRegistration = async () => {
    setIsLoading(true);
    try {
      const profilePhotoURI = profilePhoto || DEFAULT_PROFILE_PHOTO;
      const carData: Car =
        role === "Conductor"
          ? {
              plate,
              color,
              brand,
              seats: parseInt(seats, 10),
              photoURL: image || null,
            }
          : { plate: null, color: null, brand: null, seats: null, photoURL: null };

      await signUp(userEmail, password, userName, profilePhotoURI, carData, role);

     
      router.replace("/auth");
      
    } catch (error) {
      console.error("Error al registrar:", error);
      Alert.alert("Error", "No se pudo completar el registro.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    // Si ya está en el último paso, validamos y finalizamos
    if (step === maxStep) {
      if (!userName || !userEmail || !password) {
        return Alert.alert("Error", "Completa todos los campos de usuario.");
      }
      if (!termsAccepted) {
        return Alert.alert("Error", "Debes aceptar términos y condiciones.");
      }
      if (role === "Conductor" && (!plate||!brand||!color||!seats)) {
        return Alert.alert("Error", "Completa todos los campos del vehículo.");
      }
      return finalizeRegistration();
    }

    // Validaciones en step 0 (datos básicos)
    if (step === 0) {
      if (!userName||!userEmail||!password) {
        return Alert.alert("Error", "Completa todos los campos de usuario.");
      }
      if (!termsAccepted) {
        return Alert.alert("Error", "Debes aceptar términos y condiciones.");
      }
    }

    // Avanza de paso
    const next = step + 1;
    setStep(next);
    Animated.timing(progress, {
      toValue: next,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleBack = () => {
    if (step > 0) {
      const prev = step - 1;
      setStep(prev);
      Animated.timing(progress, {
        toValue: prev,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const stepTexts = [
    { title: "Registrar", subtitle: "Crea una cuenta" },
    { title: "Elige tu rol", subtitle: "Usuario o Conductor" },
    { title: "Datos del carro", subtitle: "Completa tu info" },
  ];

  return (
    <View style={styles.container}>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {/* Header y barra de progreso */}
          <View style={styles.fixedTop}>
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progress.interpolate({
                      inputRange: [0, maxStep],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={styles.title}>{stepTexts[step].title}</Text>
            <Text style={styles.fixedSubtitle}>{stepTexts[step].subtitle}</Text>
          </View>

          {/* Formulario */}
          <ScrollView contentContainerStyle={styles.formContainer}>
            {/* Paso 0: datos usuario */}
            {step === 0 && (
              <View style={styles.form}>
                <View style={styles.centered}>
                  <TouchableOpacity onPress={showPhotoOptions}>
                    <Image
                      source={{ uri: profilePhoto || DEFAULT_PROFILE_PHOTO }}
                      style={styles.profileImage}
                    />
                  </TouchableOpacity>
                  <Text style={{ color: colors.darkGrey }}>Toca para cambiar</Text>
                </View>
                <Text style={styles.inputLabel}>Nombre</Text>
                <TextInput
                  style={[styles.input, focusedInput==="name"&&styles.inputFocused]}
                  placeholder="Ej. María Pérez"
                  placeholderTextColor={colors.grey}
                  value={userName}
                  onChangeText={setUserName}
                  onFocus={()=>setFocusedInput("name")}
                  onBlur={()=>setFocusedInput(null)}
                />
                <Text style={styles.inputLabel}>Correo</Text>
                <TextInput
                  style={[styles.input, focusedInput==="email"&&styles.inputFocused]}
                  placeholder="email@dominio.com"
                  placeholderTextColor={colors.grey}
                  value={userEmail}
                  onChangeText={setUserEmail}
                  onFocus={()=>setFocusedInput("email")}
                  onBlur={()=>setFocusedInput(null)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Text style={styles.inputLabel}>Contraseña</Text>
                <TextInput
                  style={[styles.input, focusedInput==="password"&&styles.inputFocused]}
                  placeholder="Contraseña"
                  placeholderTextColor={colors.grey}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={()=>setFocusedInput("password")}
                  onBlur={()=>setFocusedInput(null)}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={()=>setShowPassword(v=>!v)}
                >
                  <MaterialIcons
                    name={showPassword?"visibility-off":"visibility"}
                    size={24}
                    color={colors.grey}
                  />
                </TouchableOpacity>

                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={[styles.checkbox, termsAccepted&&styles.checkboxChecked]}
                    onPress={()=>setTermsAccepted(v=>!v)}
                  >
                    {termsAccepted&&(
                      <MaterialIcons name="check" size={16} color={colors.white}/>
                    )}
                  </TouchableOpacity>
                  <Text style={styles.checkboxText}>
                    Acepto{" "}
                    <Text style={styles.termsText}>Términos y Condiciones</Text>
                  </Text>
                </View>
              </View>
            )}

            {/* Paso 1: selección de rol */}
            {step===1&&(
              <View style={styles.roleSelectorContainer}>
                <TouchableOpacity
                  style={[styles.roleButton, role==="Usuario"&&styles.roleButtonSelected]}
                  onPress={()=>setRole("Usuario")}
                >
                  <Text style={[styles.roleButtonText, role==="Usuario"&&styles.roleButtonTextSelected]}>
                    Usuario
                  </Text>
                  {role==="Usuario"&&<MaterialIcons name="check" size={24} color={colors.blue}/>}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleButton, role==="Conductor"&&styles.roleButtonSelected]}
                  onPress={()=>setRole("Conductor")}
                >
                  <Text style={[styles.roleButtonText, role==="Conductor"&&styles.roleButtonTextSelected]}>
                    Conductor
                  </Text>
                  {role==="Conductor"&&<MaterialIcons name="check" size={24} color={colors.blue}/>}
                </TouchableOpacity>
              </View>
            )}

            {/* Paso 2: datos del carro (solo conductor) */}
            {step===2&&role==="Conductor"&&(
              <View style={styles.form}>
                <Text style={styles.inputLabel}>Placa</Text>
                <TextInput
                  style={[styles.input, focusedInput==="plate"&&styles.inputFocused]}
                  placeholder="ABC123"
                  placeholderTextColor={colors.grey}
                  value={plate}
                  onChangeText={setPlate}
                  onFocus={()=>setFocusedInput("plate")}
                  onBlur={()=>setFocusedInput(null)}
                />
                <Text style={styles.inputLabel}>Marca</Text>
                <TextInput
                  style={[styles.input, focusedInput==="brand"&&styles.inputFocused]}
                  placeholder="Toyota"
                  placeholderTextColor={colors.grey}
                  value={brand}
                  onChangeText={setBrand}
                  onFocus={()=>setFocusedInput("brand")}
                  onBlur={()=>setFocusedInput(null)}
                />
                <Text style={styles.inputLabel}>Color</Text>
                <TextInput
                  style={[styles.input, focusedInput==="color"&&styles.inputFocused]}
                  placeholder="Rojo"
                  placeholderTextColor={colors.grey}
                  value={color}
                  onChangeText={setColor}
                  onFocus={()=>setFocusedInput("color")}
                  onBlur={()=>setFocusedInput(null)}
                />
                <Text style={styles.inputLabel}>Asientos</Text>
                <TextInput
                  style={[styles.input, focusedInput==="seats"&&styles.inputFocused]}
                  placeholder="4"
                  placeholderTextColor={colors.grey}
                  value={seats}
                  onChangeText={setSeats}
                  onFocus={()=>setFocusedInput("seats")}
                  onBlur={()=>setFocusedInput(null)}
                  keyboardType="numeric"
                />
                <Text style={styles.inputLabel}>Foto del Vehículo</Text>
                <TouchableOpacity style={styles.uploadButton} onPress={handleImagePicker}>
                  <View style={styles.uploadButtonContent}>
                    <MaterialIcons name="photo-camera" size={24} color={colors.white}/>
                    <Text style={styles.uploadButtonText}>Subir Foto</Text>
                  </View>
                </TouchableOpacity>
                {image&&<Image source={{uri:image}} style={styles.selectedImage}/>}
              </View>
            )}
          </ScrollView>

          {/* Botones Inferiores */}
          <View style={styles.buttonsContainer}>
            {step>0&&(
              <TouchableOpacity style={styles.ableButton} onPress={handleBack}>
                <Text style={styles.buttonText}>Anterior</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.mainButton} onPress={handleNext}>
              <Text style={styles.mainButtonText}>
                {step===maxStep?"Finalizar":"Siguiente"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Modal Android para foto */}
          {Platform.OS==="android"&&(
            <Modal transparent visible={modalVisible} animationType="fade">
              <TouchableWithoutFeedback onPress={()=>setModalVisible(false)}>
                <View style={styles.modalOverlay}/>
              </TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <TouchableOpacity style={styles.modalOption} onPress={()=>{
                  pickProfilePhoto(); setModalVisible(false);
                }}>
                  <Text style={styles.modalOptionText}>Galería</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalOption} onPress={()=>{
                  takeProfilePhoto(); setModalVisible(false);
                }}>
                  <Text style={styles.modalOptionText}>Cámara</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalOption,{borderTopWidth:1,borderColor:"#ccc"}]} onPress={()=>setModalVisible(false)}>
                  <Text style={[styles.modalOptionText,{color:"red"}]}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </Modal>
          )}
        </>
      )}
    </View>
  );
}

export default Register;

const styles = StyleSheet.create({
  container: { flex:1, paddingHorizontal:30, backgroundColor:colors.white },
  fixedTop:{ marginTop:60, marginBottom:20 },
  progressBarContainer:{ width:"100%", height:10, backgroundColor:"#EAEAEA", borderRadius:5, overflow:"hidden", marginBottom:10 },
  progressBar:{ height:"100%", backgroundColor:colors.blue },
  title:{ fontSize:20, fontWeight:"600", color:colors.black, marginBottom:4 },
  fixedSubtitle:{ fontSize:16, color:colors.darkGrey, marginBottom:20 },
  formContainer:{ paddingBottom:40 },
  form:{ marginBottom:30 },
  centered:{ alignItems:"center", marginVertical:20 },
  profileImage:{ width:120, height:120, borderRadius:60, borderWidth:2, borderColor:colors.blue },
  inputLabel:{ fontSize:14, color:colors.darkGrey, marginBottom:5 },
  input:{ backgroundColor:"#F8F8F8", borderRadius:12, padding:12, fontSize:16, marginBottom:10, borderWidth:1, borderColor:"#EAEAEA" },
  inputFocused:{ borderColor:colors.blue, borderWidth:2 },
  eyeIcon:{ position:"absolute", right:16, top:162 },
  checkboxContainer:{ flexDirection:"row", alignItems:"center", marginBottom:10 },
  checkbox:{ width:20, height:20, borderWidth:1, borderColor:colors.blue, marginRight:8, justifyContent:"center", alignItems:"center", borderRadius:3 },
  checkboxChecked:{ backgroundColor:colors.blue },
  checkboxText:{ fontSize:14 },
  termsText:{ color:colors.blue, textDecorationLine:"underline" },
  roleSelectorContainer:{ marginBottom:30 },
  roleButton:{ padding:16, borderRadius:12, borderWidth:1, borderColor:"#EAEAEA", backgroundColor:"#F8F8F8", marginBottom:10, flexDirection:"row", justifyContent:"space-between", alignItems:"center" },
  roleButtonSelected:{ backgroundColor:colors.lightBlue, borderColor:colors.blue },
  roleButtonText:{ fontSize:16, color:colors.darkGrey },
  roleButtonTextSelected:{ color:colors.blue },
  uploadButton:{ backgroundColor:colors.blue, borderRadius:12, padding:14, alignItems:"center", marginTop:8 },
  uploadButtonContent:{ flexDirection:"row", alignItems:"center" },
  uploadButtonText:{ color:colors.white, marginLeft:8 },
  selectedImage:{ width:150, height:100, borderRadius:8, marginTop:10 },
  buttonsContainer:{ flexDirection:"row", justifyContent:"space-between", paddingVertical:16 },
  ableButton:{ backgroundColor:"#EAEAEA", padding:14, borderRadius:12, flex:1, marginRight:8, alignItems:"center" },
  buttonText:{ color:colors.black, fontSize:16 },
  mainButton:{ backgroundColor:colors.blue, padding:14, borderRadius:12, flex:1, marginLeft:8, alignItems:"center" },
  mainButtonText:{ color:colors.white, fontSize:16 },
  modalOverlay:{ flex:1, backgroundColor:"rgba(0,0,0,0.4)" },
  modalContainer:{ backgroundColor:colors.white, paddingVertical:12, borderTopLeftRadius:12, borderTopRightRadius:12 },
  modalOption:{ padding:14, alignItems:"center" },
  modalOptionText:{ fontSize:18 },
  loaderContainer:{ flex:1, justifyContent:"center", alignItems:"center" },
  loaderText:{ marginTop:12, fontSize:16, color:colors.black },
});
