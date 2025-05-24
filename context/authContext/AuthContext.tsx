import React, { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { auth } from "../../utils/FirebaseConfig";
import { db, storage } from "../../utils/FirebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Interfaz para el carro
interface Car {
  plate: string | null;
  color: string | null;
  brand: string | null;
  seats: number | null;
  photoURL: string | null; // URL de la foto del carro
}

// Interfaz para el contexto de autenticación
interface AuthContextProps {
  user: User | null;
  userName: string | null;
  userEmail: string | null;
  userRole: string | null;
  profilePhotoURL: string | null; // Foto de perfil del usuario
  car: Car | null; // Información del carro
  login: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    profilePhotoURI: string | null, // URI local o remota de la foto perfil para subir
    car: Car | null,
    role: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

// Crear el contexto
const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

// Custom hook para usar el contexto
export const useAuth = () => useContext(AuthContext);

// Función genérica para subir imagen a Firebase Storage
const uploadImage = async (uri: string, folder: string, id: string) => {
  try {
    const storageRef = ref(storage, `${folder}/${id}_${Date.now()}`);
    const response = await fetch(uri);
    const blob = await response.blob();
    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error("Error al subir la imagen:", error);
    return "";
  }
};

// Proveedor del contexto de autenticación
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profilePhotoURL, setProfilePhotoURL] = useState<string | null>(null);
  const [car, setCar] = useState<Car | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserName(data?.name || null);
          setUserEmail(currentUser.email || null);
          setUserRole(data?.role || "user");
          setProfilePhotoURL(data?.profilePhotoURL || null);
          setCar(data?.car || null);
        }
      } else {
        // Si no hay usuario logueado, limpiar estados
        setUserName(null);
        setUserEmail(null);
        setUserRole(null);
        setProfilePhotoURL(null);
        setCar(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    profilePhotoURI: string | null,
    car: Car | null,
    role: string
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Subir foto de perfil si existe
      let uploadedProfilePhotoURL = "";
      if (profilePhotoURI) {
        uploadedProfilePhotoURL = await uploadImage(
          profilePhotoURI,
          "profilePhotos",
          firebaseUser.uid
        );
      }

      // Subir foto del carro si es conductor y tiene foto
      let uploadedCarPhotoURL = "";
      if (role === "Conductor" && car && car.photoURL) {
        uploadedCarPhotoURL = await uploadImage(
          car.photoURL,
          "carPhotos",
          firebaseUser.uid
        );
      }

      // Guardar datos en Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), {
        name,
        email,
        uid: firebaseUser.uid,
        role,
        profilePhotoURL: uploadedProfilePhotoURL || null,
        car:
          role === "Conductor" && car
            ? { ...car, photoURL: uploadedCarPhotoURL || car.photoURL }
            : null,
      });

      // Actualizar estados locales
      setUserName(name);
      setUserEmail(email);
      setUserRole(role);
      setProfilePhotoURL(uploadedProfilePhotoURL || null);
      setCar(role === "Conductor" ? car : null);
    } catch (error) {
      console.error("Error al registrar usuario:", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userName,
        userEmail,
        userRole,
        profilePhotoURL,
        car,
        login,
        signUp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
