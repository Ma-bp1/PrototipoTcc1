import * as Notifications from 'expo-notifications';

type Med = { id: string; name: string; times: string[] }; // times: ['08:00', '20:00']

export async function cancelMedication(medId: string) {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((n) => n.identifier.startsWith(`${medId}-`))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

export async function scheduleMedication(med: Med) {
  await cancelMedication(med.id); // evita duplicar ao editar
  for (const time of med.times) {
    const [hour, minute] = time.split(':').map(Number);
    await Notifications.scheduleNotificationAsync({
      identifier: `${med.id}-${time}`,
      content: {
        title: 'Hora do remédio',
        body: med.name,
        data: { medId: med.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: 'doses',
      },
    });
  }
}