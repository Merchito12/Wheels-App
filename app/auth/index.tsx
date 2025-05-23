import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Image 
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/authContext/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "../../styles/Colors"; // Usando los colores definidos

const LoginScreen = () => {
  const router = useRouter();
  const { login, userRole } = useAuth(); // Accediendo al método login desde el contexto
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<{ email?: string; password?: string }>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    let errors: { email?: string; password?: string } = {};

    if (!email) {
      errors.email = "El correo es obligatorio.";
    } else if (!validateEmail(email)) {
      errors.email = "Formato de email inválido.";
    }

    if (!password) {
      errors.password = "La contraseña es obligatoria.";
    } else if (password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres.";
    }

    setErrorMessage(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      await login(email, password);  // Usando el login del contexto
      Alert.alert("Éxito", "Usuario ingresado correctamente.");

      // Redirigir según el rol del usuario
      if (userRole === 'Conductor') {
        router.push("/conductor");  // Redirige a la pantalla del conductor
      } else if (userRole === 'Usuario') {
        router.push("/usuario");  // Redirige a la pantalla del usuario
      } else {
        router.push("/usuario");  // Redirige a la pantalla principal si no tiene rol definido
      }

    } catch (error: any) {
      Alert.alert("Error", getErrorMessage(error.code));
    }
  };

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "auth/invalid-email":
        return "Formato de email inválido.";
      case "auth/user-not-found":
        return "Usuario no encontrado.";
      case "auth/wrong-password":
        return "Contraseña incorrecta.";
      default:
        return "Ocurrió un error. Inténtalo de nuevo.";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {/* <Image source={require("../path_to_your_image")} style={styles.image} /> */}
      </View>

      <Text style={styles.greeting}>Iniciar Sesión</Text>

      <TextInput
        style={[
          styles.input,
          errorMessage.email && styles.inputError
        ]}
        placeholder="Correo electrónico"
        placeholderTextColor={colors.grey}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      {errorMessage.email && <Text style={styles.errorText}>{errorMessage.email}</Text>}

      <View style={styles.passwordContainer}>
        <TextInput
          style={[
            styles.input,
            errorMessage.password && styles.inputError
          ]}
          placeholder="Contraseña"
          placeholderTextColor={colors.grey}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
         <TouchableOpacity>
        <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <MaterialIcons name={showPassword ? "visibility-off" : "visibility"} size={24} color={colors.grey} />
        </TouchableOpacity>
      </View>
      {errorMessage.password && <Text style={styles.errorText}>{errorMessage.password}</Text>}

      <TouchableOpacity onPress={handleLogin} style={styles.mainButton}>
        <Text style={styles.mainButtonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/auth/Register")} style={styles.toggleContainer}>
        <Text style={styles.toggleText}>
          ¿No tienes cuenta?{" "}
          <Text style={styles.toggleTextHighlight}>Regístrate</Text>
        </Text>
      </TouchableOpacity>

     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  imageContainer: {
    width: "100%",
    height: 200, // Ajusta el tamaño de la imagen
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",  // Para que la imagen se ajuste bien sin distorsionarse
  },
  greeting: {
    fontSize: 28,
    fontWeight: "600",
    color: colors.black, // Título en negro
    marginBottom: 40,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 10,
    color: colors.darkGrey,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  inputError: {
    borderColor: "red",
    borderWidth: 2,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  mainButton: {
    backgroundColor: colors.blue,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    marginTop: 30,

  },
  mainButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  toggleContainer: {
    marginTop: 10,
  },
  toggleText: {
    color: colors.grey,
    fontSize: 14,
  },
  toggleTextHighlight: {
    color: colors.blue,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  passwordContainer: {
    position: "relative",
    width: "100%",
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 16,
  },
  forgotPasswordText: {
    color: colors.blue,
    fontSize: 14,
    marginTop: 10,
    alignSelf: "flex-start",  // Alineado a la izquierda
  },
});

export default LoginScreen;