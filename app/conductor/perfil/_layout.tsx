import { Stack } from "expo-router";
export default function RootLayout() {
  return (
     <Stack screenOptions={{headerShown:false,}}>
        <Stack.Screen name="index" options={{headerShown:false}} />
        <Stack.Screen name="editarPerfil" options={{headerShown:true,headerTitle: "Edita tu perfil",headerBackTitle:"ㅤ",}} />
        <Stack.Screen name="editarAuto" options={{headerShown:true,headerTitle: "Edita tu auto",headerBackTitle:"ㅤ",}} />
        <Stack.Screen name="soporte" options={{headerShown:true,headerTitle:"Soporte",headerBackTitle:"ㅤ",}} />
        <Stack.Screen name="terminos-y-condiciones" options={{ headerShown:true,headerTitle:"Términos y condiciones",headerBackTitle:"ㅤ", }} />
        <Stack.Screen name="chat" options={{headerShown: true,headerTitle: "Bienvenido al chatbot",headerBackTitle:"ㅤ",}}/>
      </Stack>
  );
}
