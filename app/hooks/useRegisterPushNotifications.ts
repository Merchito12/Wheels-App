import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { Platform, Alert } from "react-native";
import { db } from "../../utils/FirebaseConfig";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useAuth } from "../../context/authContext/AuthContext";

export function useRegisterPushNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    async function register() {
      if (!user) return;

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          "Permisos denegados",
          "No se otorgaron permisos para notificaciones push."
        );
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        expoPushTokens: arrayUnion(token),
      });

      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
    }

    register();
  }, [user]);
}
