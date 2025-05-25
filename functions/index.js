import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import admin from 'firebase-admin';
import fetch from 'node-fetch';

admin.initializeApp();

export const enviarNotificacionNuevoPunto = onDocumentUpdated(
  'viajes/{viajeId}',
  async (event) => {
    const beforeData = event.data.before?.data() || {};
    const afterData = event.data.after?.data() || {};

    const puntosBefore = beforeData.puntos || [];
    const puntosAfter = afterData.puntos || [];

    if (puntosAfter.length > puntosBefore.length) {
      const nuevoPunto = puntosAfter[puntosAfter.length - 1];

      const conductorId = afterData.idConductor;
      if (!conductorId) return;

      const conductorSnap = await admin.firestore().collection('users').doc(conductorId).get();
      const tokens = conductorSnap.data()?.expoPushTokens || [];
      if (tokens.length === 0) return;

      const messages = tokens.map(token => ({
        to: token,
        sound: 'default',
        title: 'Nuevo punto agregado',
        body: `Se agregó un nuevo punto: ${nuevoPunto.direccion}`,
        data: { viajeId: event.params.viajeId, tipo: 'nuevo_punto' },
      }));

      const chunkSize = 100;
      for (let i = 0; i < messages.length; i += chunkSize) {
        const chunk = messages.slice(i, i + chunkSize);
        try {
          const res = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Accept-encoding': 'gzip, deflate',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(chunk),
          });
          const data = await res.json();
          console.log('Respuesta Expo Push:', data);
        } catch (error) {
          console.error('Error enviando notificación:', error);
        }
      }
    }
  }
);
