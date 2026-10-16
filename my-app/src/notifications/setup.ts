import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function setupNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('doses', {
      name: 'Lembretes de remédio',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 300, 500], // vibração
    });
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}