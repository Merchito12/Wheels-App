import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import colors from '@/styles/Colors';
import { useAuth } from '@/context/authContext/AuthContext';
import type { Message } from '@/app/interfaces/AppInterfaces';

const SUGERENCIAS = [
  'Estoy teniendo problemas con la app',
  '¿Cómo creo un viaje como conductor?',
  'El viaje está más largo de lo esperado',
  'Tengo dificultades con la ubicación de recogida o destino',
  'Hay un cambio de planes con la hora de salida o llegada',
];

export default function Chat() {
  const { userName } = useAuth();

  const initialBotMessage = `Hola ${userName || ''}, Soy tu Wheely, tu asistente virtual. ¿En qué te puedo colaborar?`;
  const [messages, setMessages] = useState<Message[]>([
    {
      text: initialBotMessage,
      sender_by: 'Bot',
      date: new Date(),
      state: 'received',
    },
  ]);

  const [userPrompt, setUserPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getResponse = async () => {
    if (!userPrompt.trim()) return;

    const userMessage: Message = {
      text: userPrompt,
      sender_by: 'Me',
      date: new Date(),
      state: 'viewed',
    };

    setMessages(prev => [...prev, userMessage]);
    setUserPrompt('');

    const contextoWheels = `Eres un asistente virtual para una aplicación llamada Wheels, la cual conecta conductores y usuarios.
- Los conductores ofrecen viajes.
- Los usuarios ven los viajes disponibles y pueden seleccionar el que mejor les convenga.
- El usuario puede sugerir puntos de recogida y negociar la tarifa con el conductor.
- Desde el lado del conductor, puede ver los puntos que debe recoger.
- Para confirmar recogida, el conductor muestra un código que el usuario debe escanear.
- El conductor finaliza el viaje después de la recogida.
- Se pueden ver solicitudes, historial y más.
Si la pregunta no está relacionada con Wheels, responde que la pregunta no tiene que ver con el contexto.
Si el usuario pide ayuda para contactar a un asesor, responde: "Puedes comunicarte con soporte en el siguiente número: 3105437755."

Pregunta: ${userPrompt}`;

    try {
      setIsLoading(true);

      
      const loadingMessage: Message = {
        text: 'Wheely está escribiendo...',
        sender_by: 'Bot',
        date: new Date(),
        state: 'received',
      };
      setMessages(prev => [...prev, loadingMessage]);

      const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyC3CGhhZXZ1TwFNK6aCb4xlg0ARfgBv96Q';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: contextoWheels }] }]
        }),
      });

      const data = await response.json();

      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response';
      const botText = rawText.replace(/\*\*/g, "");

      // Quita el mensaje loader antes de mostrar respuesta real
      setMessages(prev => prev.filter(m => m.text !== 'Wheely está escribiendo...'));

      const botMessage: Message = {
        text: botText,
        sender_by: 'Bot',
        date: new Date(),
        state: 'received',
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.log('Error en la petición:', error);
      setMessages(prev => prev.filter(m => m.text !== 'Wheely está escribiendo...'));

      const errorBotMessage: Message = {
        text: 'Error fetching response.',
        sender_by: 'Bot',
        date: new Date(),
        state: 'received',
      };
      setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender_by === 'Me';

    // Render loader con spinner y texto
    if (item.text === 'Wheely está escribiendo...') {
      return (
        <View style={[styles.msgContainer, styles.botMsg, {flexDirection:'row', alignItems:'center'}]}>
          <ActivityIndicator size="small" color={colors.blue} />
          <Text style={[styles.msgText, {marginLeft: 8, fontStyle: 'italic', color: colors.grey}]}>
            {item.text}
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.msgContainer, isUser ? styles.userMsg : styles.botMsg]}>
        <Text style={[styles.msgText, isUser ? styles.userMsgText : styles.botMsgText]}>
          {item.text}
        </Text>
      </View>
    );
  };

  const handleSuggestionPress = (suggestion: string) => setUserPrompt(suggestion);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <View style={styles.messagesContainer}>
          <FlatList
            data={messages}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesContent}
          />
        </View>

        <View style={styles.bottomContainer}>
          <FlatList
            data={SUGERENCIAS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={styles.suggestionsContainer}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSuggestionPress(item)}
              >
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Escribe tu pregunta"
              placeholderTextColor={colors.grey}
              value={userPrompt}
              onChangeText={setUserPrompt}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
              onPress={getResponse}
              disabled={isLoading}
            >
              <Text style={styles.sendButtonText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 30 },
  messagesContainer: { flex: 1, marginBottom: 15 },
  messagesContent: { paddingVertical: 8 },
  msgContainer: {
    marginVertical: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    maxWidth: '80%',
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userMsg: {
    backgroundColor: colors.lightBlue,
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
  },
  botMsg: {
    backgroundColor: colors.lightGrey100,
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
  },
  msgText: { fontSize: 14 },
  userMsgText: { color: colors.black },
  botMsgText: { color: colors.black },
  bottomContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.lightGrey100,
    paddingVertical: 12,
  },
  suggestionsContainer: { paddingVertical: 6 },
  suggestionItem: {
    backgroundColor: colors.lightBlue,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 6,
  },
  suggestionText: {
    color: colors.black,
    fontWeight: '500',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    marginTop: 12,
    backgroundColor: colors.white,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  textInput: {
    flex: 1,
    marginBottom: 20,
    height: 44,
    fontSize: 16,
    color: colors.black,
    paddingLeft: 0,
    paddingRight: 10,
  },
  sendButton: {
    backgroundColor: colors.blue,
    marginBottom: 20,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft: 1,
  },
  sendButtonDisabled: {
    backgroundColor: colors.lightGrey,
  },
  sendButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
});
