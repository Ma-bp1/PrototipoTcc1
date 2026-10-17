import type * as NotificationsType from 'expo-notifications';

let cached: typeof NotificationsType | null | undefined;

export function getNotifications() {
  if (cached !== undefined) return cached;
  try {
    cached = require('expo-notifications');
  } catch (e:any) {
    console.warn('expo-notifications indisponível neste build', e?.message);
    cached = null;
  }
  return cached;
}