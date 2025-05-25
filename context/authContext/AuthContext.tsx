import React, { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { auth, db, storage, firebaseConfig } from "../../utils/FirebaseConfig";

interface Car {
  plate: string | null;
  color: string | null;
  brand: string | null;
  seats: number | null;
  photoURL: string | null;
}

interface AuthContextProps {
  user: User | null;
  userName: string | null;
  userEmail: string | null;
  userRole: string | null;
  profilePhotoURL: string | null;
  car: Car | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    profilePhotoURI: string | null,
    car: Car | null,
    role: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const useAuth = () => useContext(AuthContext);

const uploadImageToStorage = async (uri: string, folder: string, id: string) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    const storageRef = ref(storage, `${folder}/${id}_${Date.now()}`);

    await uploadBytes(storageRef, blob);

    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    return "";
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profilePhotoURL, setProfilePhotoURL] = useState<string | null>(null);
  const [car, setCar] = useState<Car | null>(null);

  const registerExpoPushToken = async (userUid: string | null) => {
    if (Platform.OS === "web" || !userUid) {
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Permiso para notificaciones push no concedido");
      return;
    }

    try {
     const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;
      console.log("Token Expo Push obtenido:", token);

      const userRef = doc(db, "users", userUid);
      await updateDoc(userRef, {
        expoPushTokens: arrayUnion(token),
      });
    } catch (error) {
      console.error("Error registrando token Expo Push:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserName(data?.name || null);
          setUserEmail(currentUser.email || null);
          setUserRole(data?.role || null);
          setProfilePhotoURL(data?.profilePhotoURL || null);
          setCar(data?.car || null);

          await registerExpoPushToken(currentUser.uid);
        }
      } else {
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

      let uploadedProfilePhotoURL = "";
      if (
        profilePhotoURI &&
        !profilePhotoURI.startsWith("https://firebasestorage.googleapis.com")
      ) {
        uploadedProfilePhotoURL = await uploadImageToStorage(
          profilePhotoURI,
          "perfilphotos",
          firebaseUser.uid
        );
      } else {
        uploadedProfilePhotoURL = profilePhotoURI || "";
      }

      let uploadedCarPhotoURL = "";
      if (
        role === "Conductor" &&
        car &&
        car.photoURL &&
        !car.photoURL.startsWith("https://firebasestorage.googleapis.com")
      ) {
        uploadedCarPhotoURL = await uploadImageToStorage(
          car.photoURL,
          "carPhotos",
          firebaseUser.uid
        );
      } else if (car) {
        uploadedCarPhotoURL = car?.photoURL || "";
      }

      await setDoc(doc(db, "users", firebaseUser.uid), {
        name,
        email,
        uid: firebaseUser.uid,
        role,
        profilePhotoURL: uploadedProfilePhotoURL,
        car:
          role === "Conductor"
            ? { ...car, photoURL: uploadedCarPhotoURL }
            : null,
      });

      setUserName(name);
      setUserEmail(email);
      setUserRole(role);
      setProfilePhotoURL(uploadedProfilePhotoURL);
      setCar(role === "Conductor" ? car : null);

      await registerExpoPushToken(firebaseUser.uid);
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      throw error;
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
