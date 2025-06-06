import React, { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { auth, db, storage } from "../../utils/FirebaseConfig";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface Car {
  plate: string | null;
  color: string | null;
  brand: string | null;
  seats: number | null;
  photoURL: string | null;
}

interface UpdateProfileData {
  name?: string;
  profilePhotoURL?: string;
  car?: Car | null;
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
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  refreshUserData: () => Promise<void>;
  updateUserRole: (newRole: string) => Promise<void>;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profilePhotoURL, setProfilePhotoURL] = useState<string | null>(null);
  const [car, setCar] = useState<Car | null>(null);

  const loadUserData = async (currentUser: User) => {
    try {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserName(data?.name || null);
        setUserEmail(currentUser.email || null);
        setUserRole(data?.role || null);
        setProfilePhotoURL(data?.profilePhotoURL || null);
        setCar(data?.car || null);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const clearUserData = () => {
    setUserName(null);
    setUserEmail(null);
    setUserRole(null);
    setProfilePhotoURL(null);
    setCar(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserData(currentUser);
      } else {
        clearUserData();
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      let uploadedProfilePhotoURL = "";
      if (profilePhotoURI && !profilePhotoURI.startsWith("https://firebasestorage.googleapis.com")) {
        uploadedProfilePhotoURL = await uploadImageToStorage(profilePhotoURI, "perfilphotos", firebaseUser.uid);
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
        uploadedCarPhotoURL = await uploadImageToStorage(car.photoURL, "carPhotos", firebaseUser.uid);
      } else if (car) {
        uploadedCarPhotoURL = car?.photoURL || "";
      }

      await setDoc(doc(db, "users", firebaseUser.uid), {
        name,
        email,
        uid: firebaseUser.uid,
        role,
        profilePhotoURL: uploadedProfilePhotoURL,
        car: role === "Conductor" ? { ...car, photoURL: uploadedCarPhotoURL } : null,
      });

      setUserName(name);
      setUserEmail(email);
      setUserRole(role);
      setProfilePhotoURL(uploadedProfilePhotoURL);
      setCar(
        role === "Conductor"
          ? {
              plate: car?.plate ?? null,
              color: car?.color ?? null,
              brand: car?.brand ?? null,
              seats: car?.seats ?? null,
              photoURL: uploadedCarPhotoURL,
            }
          : null
      );
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (data: UpdateProfileData) => {
    if (!user) throw new Error("No hay usuario autenticado");
    try {
      let updatedProfilePhotoURL = data.profilePhotoURL || profilePhotoURL;
      let updatedCarPhotoURL = data.car?.photoURL || car?.photoURL || "";

      if (
        data.profilePhotoURL &&
        !data.profilePhotoURL.startsWith("https://firebasestorage.googleapis.com") &&
        data.profilePhotoURL !== profilePhotoURL
      ) {
        updatedProfilePhotoURL = await uploadImageToStorage(data.profilePhotoURL, "perfilphotos", user.uid);
      }

      if (
        userRole === "Conductor" &&
        data.car?.photoURL &&
        !data.car.photoURL.startsWith("https://firebasestorage.googleapis.com") &&
        data.car.photoURL !== car?.photoURL
      ) {
        updatedCarPhotoURL = await uploadImageToStorage(data.car.photoURL, "carPhotos", user.uid);
      }

      const updateData: any = {};

      if (data.name !== undefined) {
        updateData.name = data.name;
      }

      if (updatedProfilePhotoURL !== profilePhotoURL) {
        updateData.profilePhotoURL = updatedProfilePhotoURL;
      }

      if (userRole === "Conductor" && data.car) {
        updateData.car = {
          ...data.car,
          photoURL: updatedCarPhotoURL,
          seats: Number(data.car.seats),
        };
      }

      await updateDoc(doc(db, "users", user.uid), updateData);

      if (data.name !== undefined) {
        setUserName(data.name);
      }

      if (updatedProfilePhotoURL !== profilePhotoURL) {
        setProfilePhotoURL(updatedProfilePhotoURL);
      }

      if (userRole === "Conductor" && data.car) {
        setCar({
          ...data.car,
          photoURL: updatedCarPhotoURL,
          seats: Number(data.car.seats),
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const refreshUserData = async () => {
    if (user) await loadUserData(user);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserRole = async (newRole: string) => {
    if (!user) throw new Error("No hay usuario autenticado");
    try {
      await updateDoc(doc(db, "users", user.uid), { role: newRole });
      setUserRole(newRole);
    } catch (error) {
      console.error("Error actualizando rol:", error);
      throw error;
    }
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
        updateProfile,
        refreshUserData,
        updateUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
