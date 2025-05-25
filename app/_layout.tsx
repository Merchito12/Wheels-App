// app/_layout.tsx (o donde declares tu RootLayout)
import React, { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { AuthProvider } from "@/context/authContext/AuthContext";
import { ClienteProvider } from "@/context/viajeContext/viajeClienteContext";
import { ViajeProvider } from "@/context/viajeContext/ViajeConductorContext";
import { ViajeSeleccionadoProvider } from "@/context/viajeContext/ViajeSeleccionadoContext";
import { Stack } from "expo-router";



export default function RootLayout() {
  // Pedir permiso nada más iniciar la app
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== "granted") {
          alert(
            "Activa las notificaciones en ajustes para recibir alertas de viajes."
          );
        }
      }
    })();
  }, []);

  return (
    <AuthProvider>
      <ViajeProvider>
        <ViajeSeleccionadoProvider>
          <ClienteProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="auth" />
              <Stack.Screen name="(app)" />
              <Stack.Screen name="(app)/usuario" />
              <Stack.Screen name="(app)/conductor" />
              <Stack.Screen name="(app)/conductor/solicitudes" />
              <Stack.Screen name="(app)/detallesViaje" />
            </Stack>
          </ClienteProvider>
        </ViajeSeleccionadoProvider>
      </ViajeProvider>
    </AuthProvider>
  );
}
