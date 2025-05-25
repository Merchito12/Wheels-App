// services/Notifications.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:  true,
    shouldShowBanner: true,
    shouldShowList:   true,
    shouldPlaySound:  false,
    shouldSetBadge:   false,
  }),
});

export async function initNotifications() {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.warn('⚠️ Permisos de notificaciones no concedidos');
  }
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name:              'default',
      importance:        Notifications.AndroidImportance.MAX,
      vibrationPattern:  [0, 250, 250, 250],
    });
  }
}

export async function scheduleAtDate(
  title: string,
  body:  string,
  dateObj: Date
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: {
      type: SchedulableTriggerInputTypes.DATE,
      date: dateObj,
    },
  });
}
