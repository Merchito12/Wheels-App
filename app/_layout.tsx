import { AuthProvider } from "@/context/authContext/AuthContext";
import { ViajeProvider } from "@/context/viajeContext/ViajeConductorContext";
import { Stack } from "expo-router";


export default function RootLayout() {
  return (
    <AuthProvider>
      <ViajeProvider>  

        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth" />
          <Stack.Screen name="(app)" />
        </Stack>
      </ViajeProvider>
    </AuthProvider>
  );
}
