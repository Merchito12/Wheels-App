import { AuthProvider } from "@/context/authContext/AuthContext";
import { ClienteProvider } from "@/context/viajeContext/viajeClienteContext";
import { ViajeProvider } from "@/context/viajeContext/ViajeConductorContext";
import { Stack } from "expo-router";


export default function RootLayout() {
  return (
    <AuthProvider>
      <ViajeProvider> 
        <ClienteProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth" />
          <Stack.Screen name="(app)" />

        </Stack>
        </ClienteProvider>
        </ViajeProvider>

    </AuthProvider>
  );
}
