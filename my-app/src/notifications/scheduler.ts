import { getNotifications } from './native';

type Med = { id: string; name: string; times: string[] };

export async function cancelMedication(medId: string) {
  const N = getNotifications();
  if (!N) return;
  const all = await N.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((n) => n.identifier.startsWith(`${medId}-`))
      .map((n) => N.cancelScheduledNotificationAsync(n.identifier))
  );
}

export async function scheduleMedication(med: Med) {
  const N = getNotifications();
  if (!N) return;
  await cancelMedication(med.id);
  for (const time of med.times) {
    const [hour, minute] = time.split(':').map(Number);
    await N.scheduleNotificationAsync({
      identifier: `${med.id}-${time}`,
      content: { title: 'Hora do remédio', body: med.name, data: { medId: med.id } },
      trigger: {
        type: N.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: 'doses',
      },
    });
  }
}