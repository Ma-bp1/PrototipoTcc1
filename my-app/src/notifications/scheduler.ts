import { getNotifications } from './native';
import type { MedData } from '../schemas/medSchema';
import { getAlertSettings } from '../services/alertSettings';

type Med = {
  id: string;
  name: string;
  times: string[]; // "HH:mm"
  repetition: MedData['medRepetitions'];
  startAt?: number; // ms: âncora do 1º horário. Obrigatório para repetição 'horario'
};

const CHANNEL = 'doses';
// Quantas doses futuras ficam agendadas por remédio (iOS aceita ~64 notificações no total).
// A janela é renovada toda vez que scheduleMedication roda (abrir o app, confirmar dose...).
const MAX_HOURLY_AHEAD = 24;

// Próxima ocorrência de "HH:mm" (hoje, ou amanhã se já passou), em ms
export function nextOccurrence(time: string) {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
  return d.getTime();
}
const snoozeId = (medId: string) => `${medId}-snooze`;

// Cancela tudo que começa com `${medId}-`: horários, dias da semana e o adiamento pendente
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

  // Notificações desligadas nas configurações: só limpa, não agenda
  if (!(await getAlertSettings()).medAlert) return;

  // Intervalo em horas (qualquer valor, ex.: 7 em 7): doses = âncora + k * intervalo,
  // agendadas uma a uma, porque um gatilho diário não acompanha um ciclo que não fecha em 24h.
  if (med.repetition.type === 'horario') {
    const step = med.repetition.intervalHours * 60 * 60 * 1000;
    const anchor = med.startAt ?? nextOccurrence(med.times[0]);
    const skipped = Math.max(0, Math.ceil((Date.now() - anchor) / step));
    const first = anchor + skipped * step;

    for (let i = 0; i < MAX_HOURLY_AHEAD; i++) {
      const doseMs = first + i * step;
      await N.scheduleNotificationAsync({
        identifier: `${med.id}-${doseMs}`,
        content: {
          title: 'Hora do remédio',
          body: med.name,
          data: { medId: med.id, doseMs },
        },
        trigger: {
          type: N.SchedulableTriggerInputTypes.DATE,
          date: new Date(doseMs),
          channelId: CHANNEL,
        },
      });
    }
    return;
  }

  for (const time of med.times) {
    const [hour, minute] = time.split(':').map(Number);
    // `time` vai no data para a DoseAlert saber qual horário disparou
    const content = {
      title: 'Hora do remédio',
      body: med.name,
      data: { medId: med.id, time },
    };

    if (med.repetition.type === 'semanal') {
      for (const day of med.repetition.daysOfWeek) {
        await N.scheduleNotificationAsync({
          identifier: `${med.id}-${day}-${time}`,
          content,
          trigger: {
            type: N.SchedulableTriggerInputTypes.WEEKLY,
            weekday: day + 1, // expo: 1 = domingo ... 7 = sábado (assumindo 0 = domingo no seu form)
            hour,
            minute,
            channelId: CHANNEL,
          },
        });
      }
    } else {
      // 'diario'
      await N.scheduleNotificationAsync({
        identifier: `${med.id}-${time}`,
        content,
        trigger: {
          type: N.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: CHANNEL,
        },
      });
    }
  }
}

// Agenda um aviso único. Usar o mesmo identifier substitui um adiamento anterior.
// Retorna o timestamp (ms) até quando a dose ficou adiada.
export async function snoozeMedication(opts: {
  id: string;
  name: string;
  doseMs: number; // horário original da dose
  minutes: number;
}): Promise<number> {
  const untilMs = Date.now() + opts.minutes * 60 * 1000;
  const N = getNotifications();
  if (!N) return untilMs;

  await N.scheduleNotificationAsync({
    identifier: snoozeId(opts.id),
    content: {
      title: 'Hora do remédio',
      body: opts.name,
      data: { medId: opts.id, doseMs: opts.doseMs },
    },
    trigger: {
      type: N.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: opts.minutes * 60,
      repeats: false,
      channelId: CHANNEL,
    },
  });
  return untilMs;
}

// Chame ao confirmar a dose, senão o aviso adiado ainda toca depois
export async function cancelSnooze(medId: string) {
  const N = getNotifications();
  if (!N) return;
  await N.cancelScheduledNotificationAsync(snoozeId(medId));
}

// Cancela todas as notificações de medicamentos (as que carregam medId no data),
// sem mexer em outros tipos de notificação, como a de baixo estoque no futuro.
export async function cancelAllMedicationAlerts() {
  const N = getNotifications();
  if (!N) return;
  const all = await N.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((n) => n.content.data?.medId)
      .map((n) => N.cancelScheduledNotificationAsync(n.identifier))
  );
}