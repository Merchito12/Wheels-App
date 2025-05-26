import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/authContext/AuthContext";
import { EyeIcon } from "../../components/Icons";
import colors from "../../styles/Colors"; 

const LoginScreen = () => {
  const router = useRouter();
  const { login, userRole } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<{ email?: string; password?: string; general?: string }>({});

  //Redireccion dependiendo del rol del usuario
  useEffect(() => {
    if (userRole) {
      if (userRole === 'Conductor') {
        router.replace("./conductor");
      } else if (userRole === 'Usuario') {
        router.replace("./usuario");
      } else {
        router.replace("./");
      }
    }
  }, [userRole]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    let errors: { email?: string; password?: string; general?: string } = {};

    // Validaciones email y contraseña
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
      await login(email, password);  
    } catch (error: any) {
      // Reiniciar errores previos
      let loginErrors: { email?: string; password?: string; general?: string } = {};

      // Según el código de error de Firebase, asignar mensaje a email o password
      switch (error.code) {
        case "auth/invalid-email":
          loginErrors.email = "Formato de email inválido.";
          break;
        case "auth/user-not-found":
          loginErrors.email = "Usuario no encontrado.";
          break;
        case "auth/wrong-password":
          loginErrors.password = "Contraseña incorrecta.";
          break;
        
        default:
          loginErrors.general = "Usuario o contraseña incorrectos.";
          break;
      }

      setErrorMessage(loginErrors);
    }
  };

  return (
    <View style={styles.container}>
     
    
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
        

        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <EyeIcon visible={showPassword} size={24} color={colors.grey} />
        </TouchableOpacity>
      </View>
      {errorMessage.password && <Text style={styles.errorText}>{errorMessage.password}</Text>}

      {/* Mensaje general de error */}
      {errorMessage.general && (
        <Text style={[styles.errorText, { textAlign: "center", marginBottom: 10 }]}>
          {errorMessage.general}
        </Text>
      )}
        <TouchableOpacity>
          <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
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
    height: 200, 
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",  
  },
  greeting: {
    fontSize: 28,
    fontWeight: "600",
    color: colors.black, 
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
    alignSelf: "flex-start",
  },
});
export default LoginScreen;
