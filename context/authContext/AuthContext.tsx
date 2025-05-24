import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from "firebase/auth";
import { auth } from "../../utils/FirebaseConfig";
import { db, storage } from "../../utils/FirebaseConfig"; 
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
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
  car: Car | null;  // Información del carro
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, car: Car | null, role: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Crear el contexto
const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

// Custom hook para usar el contexto
export const useAuth = () => useContext(AuthContext);

// Función para subir la imagen del vehículo a Firebase Storage
const uploadImage = async (uri: string, id: string) => {
  const storageRef = ref(storage, `carPhotos/${id}_${Date.now()}`);
  try {
    // Convertir el URI de la imagen en un blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Subir el blob a Firebase Storage
    const snapshot = await uploadBytes(storageRef, blob);
    
    // Obtener la URL de descarga de la imagen
    const url = await getDownloadURL(storageRef);

    console.log("URL de la imagen subida:", url);
    
    return url ?? ""; // Retornar la URL de la imagen subida
  } catch (error) {
    console.error("Error al subir la imagen:", error);
    return "";
  }
};

// Proveedor del contexto de autenticación
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [car, setCar] = useState<Car | null>(null); // Estado para manejar el carro

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Obtener el nombre, correo, rol y carro del usuario desde Firestore
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data()?.name || null);
          setUserEmail(currentUser.email || null);
          setUserRole(userDoc.data()?.role || "user"); // Obtener el rol del usuario
          setCar(userDoc.data()?.car || null); // Obtener el carro del usuario
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name: string, car: Car | null, role: string) => {
    try {
      console.log("Signing up with car data:", car);  // Verifica los datos que se pasan
  
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Si el usuario es un conductor y tiene foto del vehículo, subimos la imagen
      let imageUrl = "";
      if (car && car.photoURL) {
        imageUrl = await uploadImage(car.photoURL, firebaseUser.uid); // Subimos la imagen del carro
      }
  
      // Guardar los datos del usuario en Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), {
        name: name,
        email: email,
        uid: firebaseUser.uid,
        role: role, // Guardamos el rol proporcionado (Usuario o Conductor)
        car: role === "Conductor" ? { ...car, photoURL: imageUrl } : null, // Solo guardamos el carro si es conductor
      });
      
      setUserName(name);  // Establecer el nombre después del registro
      setUserEmail(email); // Establecer el correo después del registro
      setUserRole(role); // Guardamos el rol correctamente
      setCar(role === "Conductor" ? car : null); // Si es conductor, asignamos el carro
      
    } catch (error) {
      console.error("Error al registrar usuario:", error);
    }
  };
  

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, userName, userEmail, userRole, car, login, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
  
};
// Exportar el contexto para usarlo en otros componentes
export default AuthContext;


