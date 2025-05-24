import { AuthProvider } from "@/context/authContext/AuthContext";
import { ClienteProvider } from "@/context/viajeContext/viajeClienteContext";
import { ViajeProvider } from "@/context/viajeContext/ViajeConductorContext";
import { ViajeSeleccionadoProvider } from "@/context/viajeContext/ViajeSeleccionadoContext";
import { Stack } from "expo-router";


export default function RootLayout() {
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

console.log('AuthProvider:', AuthProvider);
console.log('ViajeProvider:', ViajeProvider);
console.log('ViajeSeleccionadoProvider:', ViajeSeleccionadoProvider);
console.log('ClienteProvider:', ClienteProvider);

