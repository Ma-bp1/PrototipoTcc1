import { Platform } from 'react-native';
import { getNotifications } from './native';

export async function setupNotifications() {
  const N = getNotifications();
  if (!N) return false;

  N.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await N.setNotificationChannelAsync('doses', {
      name: 'Lembretes de remédio',
      importance: N.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 300, 500],
    });
  }
  const { status } = await N.requestPermissionsAsync();
  return status === 'granted';
}