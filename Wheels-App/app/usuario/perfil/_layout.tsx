import { AuthProvider } from "@/context/authContext/AuthContext";
import { Stack } from "expo-router";


export default function RootLayout() {
  return (
    <AuthProvider>
        <Stack screenOptions={{headerShown:false}}>
        <Stack.Screen name="index" options={{headerShown:false}} />
           <Stack.Screen 
          name="chat" 
          options={{
            headerShown: true,
            headerTitle: "Bienvenido",
            
            
          }} 
        />

      <Stack.Screen name="editarPerfil" options={{headerShown:true }} />
      <Stack.Screen name="soporte"
       options={{
        headerShown:true,
        headerTitle:"Soporte",
        }} />
      <Stack.Screen name="terminos-y-condiciones"
       options={{
        headerShown:true,
        headerTitle:"Terminos y condiciones",
        }} />

      </Stack>
    </AuthProvider>
    
  );
}

