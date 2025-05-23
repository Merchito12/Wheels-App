// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import Constants from "expo-constants";

const firebaseConfig = {
  apiKey: "AIzaSyCuzTXMl1at07F8anls2058sqyOOn8uejc",
  authDomain: "proyecto-final-dam-85abd.firebaseapp.com",
  projectId: "proyecto-final-dam-85abd",
  storageBucket: "proyecto-final-dam-85abd.firebasestorage.app",
  messagingSenderId: "582895250432",
  appId: "1:582895250432:web:fc0d51c529cf3010fa7ce5",
  measurementId: "G-4KYR59Y1ZP"
};



const app = initializeApp(firebaseConfig);
export const storage = getStorage(app); 
export const db = getFirestore(app);
export const auth = getAuth(app);
