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
  ActivityIndicator
} from "react-native";
// al comienzo del archivo añade esto
import AsyncStorage from '@react-native-async-storage/async-storage';


interface Car {
  plate: string | null;
  color: string | null;
  brand: string | null;
  seats: number | null;
  photoURL: string | null;
}

import { MaterialIcons } from "@expo/vector-icons";
import colors from "../../styles/Colors"; // Usando los colores definidos
import { Redirect, router } from "expo-router";
import * as ImagePicker from 'expo-image-picker'; // Librería para seleccionar imagen
import { useAuth } from "../../context/authContext/AuthContext"; // Contexto de autenticación

// Componente Loader simple dentro de este archivo
const Loader = () => (
  <View style={styles.loaderContainer}>
    <ActivityIndicator size="large" color={colors.blue} />
    <Text style={styles.loaderText}>Estamos configurando tu perfil...</Text>
  </View>
);

export function Register() {
  const [step, setStep] = useState(0);  // Para controlar las diferentes vistas
  const [redirect, setRedirect] = useState(false); // Para redireccionar después de finalizar
  const progress = useState(new Animated.Value(0))[0]; // Inicializamos la barra de progreso
  const [focusedInput, setFocusedInput] = useState<string | null>(null); // Para manejar el enfoque del input
  const [termsAccepted, setTermsAccepted] = useState(false); // Para controlar el checkbox de los términos
  const [showPassword, setShowPassword] = useState(false); // Para controlar si se ve la contraseña
  const [role, setRole] = useState("Usuario"); // Estado para almacenar el rol seleccionado
  const [isLoading, setIsLoading] = useState(false); // Para mostrar el loader
  const [isRedirecting, setIsRedirecting] = useState(false); // Para manejar la redirección después de 4 segundos
  const [image, setImage] = useState<string | null>(null); // Para almacenar la imagen seleccionada
  const [userName, setUserName] = useState(""); // Para guardar el nombre
  const [userEmail, setUserEmail] = useState(""); // Para guardar el email
  const [password, setPassword] = useState(""); // Para guardar la contraseña
  const [plate, setPlate] = useState(""); // Para guardar la placa del carro
  const [brand, setBrand] = useState(""); // Para guardar la marca del carro
  const [color, setColor] = useState(""); // Para guardar el color del carro
  const [seats, setSeats] = useState(""); // Para guardar la cantidad de asientos del carro
  
  const {  signUp } = useAuth();

  const handleNext = async () => {
    if (step === 2) {
      try {
        setIsLoading(true);
  
        if (!userName || !userEmail || !password) {
          Alert.alert("Error", "Por favor completa todos los campos de usuario.");
          setIsLoading(false);
          return;
        }
  
        if (!termsAccepted) {
          Alert.alert("Error", "Debes aceptar los términos y condiciones.");
          setIsLoading(false);
          return;
        }
  
        if (role === "Conductor") {
          if (!plate || !color || !brand || !seats) {
            Alert.alert("Error", "Todos los campos del vehículo son obligatorios.");
            setIsLoading(false);
            return;
          }
        }
  
        const carData: Car = {
          plate: plate || null,
          color: color || null,
          brand: brand || null,
          seats: seats ? parseInt(seats, 10) : null,
          photoURL: image || null,
        };
  
        await signUp(userEmail, password, userName, carData, role);
  
        setIsRedirecting(true);
      } catch (error) {
        console.error("Error al registrar el usuario:", error);
        Alert.alert("Error", "No se pudo registrar el usuario.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setStep((prev) => prev + 1);
      Animated.timing(progress, {
        toValue: (step + 1) * 33,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  };
  
  
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1); // Retrocede un paso
      Animated.timing(progress, {
        toValue: (step - 1) * 33,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permiso denegado", "Es necesario permiso para acceder a la galería.");
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImage(uri);
      await AsyncStorage.setItem("localPhotoUri", uri);
    }
  };
  
  
  const handleCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permiso denegado", "Es necesario permiso para acceder a la cámara.");
      return;
    }
  
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!result.canceled) {
      setImage(result.assets[0].uri); // Establecer la URI de la imagen tomada
    }
  };

  useEffect(() => {
    if (isRedirecting) {
      const timeout = setTimeout(() => {
        if (role === "Conductor") {
          router.replace("./conductor");
        } else {
          router.replace("./usuario");
        }
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [isRedirecting, role]);
  

  if (redirect) {
    return <Redirect href="./auth" />;
  }

  // Textos para cada paso del registro
  const stepTexts = [
    { title: "Registrar", subtitle: "Crea una cuenta" },
    { title: "Personaliza tu experiencia", subtitle: "Escoge tu rol" },
    { title: "Registra tu carro", subtitle: "Ingresa la información del vehículo" },
  ];

  const handleFocus = (inputName: string) => {
    setFocusedInput(inputName);
  };

  const handleBlur = () => {
    setFocusedInput(null);
  };

  const handleTermsToggle = () => {
    setTermsAccepted(!termsAccepted);
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {/* Barra de Progreso con Animación */}
          <View style={styles.fixedTop}>
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[styles.progressBar, { width: progress.interpolate({
                  inputRange: [0, 33, 66],
                  outputRange: ['0%', '33%', '100%']
                }) }]} />
            </View>
            {/* Título fijo */}
            <Text style={styles.title}>{stepTexts[step].title}</Text>

            {/* Subtítulo fijo, de color gris */}
            <Text style={styles.fixedSubtitle}>{stepTexts[step].subtitle}</Text>
          </View>

          <ScrollView contentContainerStyle={styles.formContainer}>
            {/* Paso 1 - Datos de registro */}
            {step === 0 && (
              <View style={styles.form}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                style={[
                    styles.input,
                    focusedInput === "name" && styles.inputFocused,
                ]}
                placeholder="Maria Perez"
                placeholderTextColor={colors.grey}
                value={userName}
                onChangeText={setUserName}  // Actualiza el estado del nombre
                onFocus={() => handleFocus("name")}
                onBlur={handleBlur}
                />

                <TextInput
                style={[
                    styles.input,
                    focusedInput === "email" && styles.inputFocused,
                ]}
                placeholder="nombre@email.com"
                placeholderTextColor={colors.grey}
                value={userEmail}
                onChangeText={setUserEmail}  // Actualiza el estado del correo
                onFocus={() => handleFocus("email")}
                onBlur={handleBlur}
                />

                <TextInput
                style={[
                    styles.input,
                    focusedInput === "password" && styles.inputFocused,
                ]}
                placeholder="Crea una contraseña"
                secureTextEntry={!showPassword}
                placeholderTextColor={colors.grey}
                value={password}
                onChangeText={setPassword}  // Actualiza el estado de la contraseña
                onFocus={() => handleFocus("password")}
                onBlur={handleBlur}
                />

                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <MaterialIcons name={showPassword ? "visibility-off" : "visibility"} size={24} color={colors.grey} />
                </TouchableOpacity>

                {/* Checkbox para aceptar los términos y condiciones */}
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity 
                    onPress={handleTermsToggle} 
                    style={[
                      styles.checkbox, 
                      termsAccepted && styles.checkboxChecked
                    ]} 
                  >
                    {termsAccepted && <MaterialIcons name="check" size={16} color={colors.white} />}
                  </TouchableOpacity>
                  <Text style={styles.checkboxText}>
                    Leí los{" "}
                    <Text style={styles.termsText}>Términos y Condiciones</Text> y la{" "}
                    <Text style={styles.termsText}>Política de Privacidad</Text>.
                  </Text>
                </View>
              </View>
            )}

            {/* Paso 2 - Selección de rol */}
            {step === 1 && (
                <View style={styles.roleSelectorContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === "Usuario" && styles.roleButtonSelected, // Cambiar fondo si es seleccionado
                  ]}
                  onPress={() => setRole("Usuario")}
                >
                  <Text style={[styles.roleButtonText, role === "Usuario" && styles.roleButtonTextSelected]}>
                    Usuario
                  </Text>
                  {role === "Usuario" && (
                    <MaterialIcons name="check" size={24} color={colors.blue} />
                  )}
                </TouchableOpacity>
              
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === "Conductor" && styles.roleButtonSelected, // Cambiar fondo si es seleccionado
                  ]}
                  onPress={() => setRole("Conductor")}
                >
                  <Text style={[styles.roleButtonText, role === "Conductor" && styles.roleButtonTextSelected]}>
                    Conductor
                  </Text>
                  {role === "Conductor" && (
                    <MaterialIcons name="check" size={24} color={colors.blue} />
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Paso 3 - Información del carro */}
            {step === 2 && role === "Conductor" && (
              <View style={styles.form}>
                <Text style={styles.inputLabel}>Placa</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedInput === "plate" && styles.inputFocused,
                  ]}
                  placeholder="ABC123"
                  placeholderTextColor={colors.grey}
                  onFocus={() => handleFocus("plate")}
                  onBlur={handleBlur}
                  value={plate}
                  onChangeText={setPlate} // Actualiza el estado para la placa
                />

                <Text style={styles.inputLabel}>Marca del Carro</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedInput === "brand" && styles.inputFocused,
                  ]}
                  placeholder="Toyota"
                  placeholderTextColor={colors.grey}
                  onFocus={() => handleFocus("brand")}
                  onBlur={handleBlur}
                  value={brand}
                  onChangeText={setBrand} // Actualiza el estado para la marca
                />

                <Text style={styles.inputLabel}>Color del Carro</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedInput === "color" && styles.inputFocused,
                  ]}
                  placeholder="Red"
                  placeholderTextColor={colors.grey}
                  onFocus={() => handleFocus("color")}
                  onBlur={handleBlur}
                  value={color}
                  onChangeText={setColor} // Actualiza el estado para el color
                />

                <Text style={styles.inputLabel}>Cantidad de Asientos Disponibles</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedInput === "seats" && styles.inputFocused,
                  ]}
                  placeholder="4"
                  placeholderTextColor={colors.grey}
                  onFocus={() => handleFocus("seats")}
                  onBlur={handleBlur}
                  value={seats}
                  onChangeText={setSeats} // Actualiza el estado para los asientos
                  keyboardType="numeric" // Asegura que solo se ingresen números
                />

                <View style={styles.form}>
                  <Text style={styles.inputLabel}>Subir Foto del Vehículo</Text>

                  <TouchableOpacity style={styles.uploadButton} onPress={handleImagePicker}>
                    <View style={styles.uploadButtonContent}>
                      <MaterialIcons name="photo-camera" size={24} color={colors.white} />
                      <Text style={styles.uploadButtonText}>Subir Foto del Vehículo</Text>
                    </View>
                  </TouchableOpacity>

                  {image && <Image source={{ uri: image }} style={styles.selectedImage} />}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Botones fijos abajo */}
          <View style={styles.buttonsContainer}>
            {step == 0 && (
              <TouchableOpacity onPress={() => router.push("./")} style={[styles.mainButton, styles.backButton]}>
                <Text style={styles.notAbleButtonText}>Iniciar Sesión</Text>
              </TouchableOpacity>
            )}
            {step > 0 && (
              <TouchableOpacity onPress={handleBack} style={[styles.ableButton]}>
                <Text style={styles.buttonText}>Anterior</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleNext} style={styles.mainButton}>
              <Text style={styles.mainButtonText}>{step === 2 ? "Finalizar" : "Siguiente"}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    backgroundColor: colors.white,
  },
  fixedTop: {
    width: "100%",
    paddingTop: 20,
    top: 60,
    zIndex: 1,
    marginBottom: 20,
  },
  progressBarContainer: {
    width: "100%",
    height: 10,
    backgroundColor: "#EAEAEA",
    borderRadius: 5,
    marginBottom: 10,
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.blue,
    borderRadius: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.black,
    marginTop: 10,
    marginBottom: 10,
    textAlign: "left",
  },
  fixedSubtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#9E9E9E",
    marginBottom: 30,
    marginTop: 0,
    textAlign: "left",
  },
  formContainer: {
    marginTop: 40,
  },
  form: {
    width: "100%",
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.darkGrey,
    marginBottom: 5,
    textAlign: "left",
  },
  input: {
    width: "100%",
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 10,
    color: colors.black,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  inputFocused: {
    borderColor: colors.blue,
    borderWidth: 2,
  },
  uploadButton: {
    backgroundColor: "#EAEAEA",
    padding: 16,
    marginBottom: 20,
    borderRadius: 12,
    textAlign: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  mainButton: {
    backgroundColor: colors.blue,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    width: "48%",
    justifyContent: "center",
  },
  ableButton: {
    backgroundColor: colors.white,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.blue,
    alignItems: "center",
    width: "48%",
    justifyContent: "center",
  },
  notAbleButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  mainButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonText: {
    color: colors.blue,
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    backgroundColor: "#EAEAEA",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checkbox: {
    marginTop: 30,
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: colors.blue,
    marginRight: 10,
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.blue,
  },
  checkboxText: {
    fontSize: 14,
    marginTop: 30,
  },
  termsText: {
    color: colors.blue,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 165,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  loaderText: {
    fontSize: 16,
    color: colors.black,
    marginTop: 20,
  },
  uploadButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  uploadButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: colors.blue,
  },
  selectedImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginTop: 10,
    alignSelf: "center",
  },
  roleSelectorContainer: {
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  roleButton: {
    width: "100%",
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 10,
    color: colors.black,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  roleButtonSelected: {
    backgroundColor: colors.lightBlue,
    borderColor: colors.blue,
  },
  roleButtonText: {
    color: colors.darkGrey,
    fontSize: 16,
    fontWeight: "600",
  },
  roleButtonTextSelected: {
    color: colors.blue,
  },
});

export default Register;
