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

const pad2 = (n: number) => String(n).padStart(2, '0');
const hhmm = (ms: number) => {
  const d = new Date(ms);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

// Evita repetir o aviso imediato da mesma dose (scheduleMedication roda várias vezes)
const avisadosAgora = new Set<string>();

// Próxima ocorrência de um dia da semana (0 = domingo) + "HH:mm", em ms
function nextWeekly(day: number, time: string) {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  while (d.getDay() !== day || d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
  return d.getTime();
}

// Se a dose está a menos de 5 min, o aviso normal já passou: avisa agora
async function avisarAgora(
  N: NonNullable<ReturnType<typeof getNotifications>>,
  med: Med,
  doseMs: number
) {
  const agora = Date.now();
  if (doseMs <= agora || doseMs - 5 * 60 * 1000 > agora) return; // fora da janela

  const key = `${med.id}-${doseMs}`;
  if (avisadosAgora.has(key)) return;
  avisadosAgora.add(key);

  const faltam = Math.max(1, Math.ceil((doseMs - agora) / 60000));
  await N.scheduleNotificationAsync({
    identifier: `${med.id}-${doseMs}-adv-now`,
    content: {
      title: `Daqui a ${faltam} min`,
      body: `${med.name} às ${hhmm(doseMs)}`,
      data: { medId: med.id, advance: true },
    },
    trigger: {
      type: N.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
      repeats: false,
      channelId: CHANNEL,
    },
  });
}

export async function scheduleMedication(med: Med) {
  const N = getNotifications();
  if (!N) return;
  await cancelMedication(med.id);

  const cfg = await getAlertSettings();
  if (!cfg.medAlert) return;
  const avisar5 = !!cfg.advance5;

  // ---------- A CADA X HORAS ----------
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

      // aviso 5 min antes
      const avisoMs = doseMs - 5 * 60 * 1000;
      if (avisar5 && avisoMs > Date.now()) {
        await N.scheduleNotificationAsync({
          identifier: `${med.id}-${doseMs}-adv`,
          content: {
            title: 'Daqui a 5 minutos',
            body: `${med.name} às ${hhmm(doseMs)}`,
            data: { medId: med.id, advance: true },
          },
          trigger: {
            type: N.SchedulableTriggerInputTypes.DATE,
            date: new Date(avisoMs),
            channelId: CHANNEL,
          },
        });
      } else if (avisar5) {
        await avisarAgora(N, med, doseMs);   // NOVO: dose dentro da janela de 5 min
      }
    }
    return;
  }

  // ---------- DIÁRIO e SEMANAL ----------
  for (const time of med.times) {
    const [hour, minute] = time.split(':').map(Number);
    const content = {
      title: 'Hora do remédio',
      body: med.name,
      data: { medId: med.id, time },
    };

    // horário do aviso (5 min antes)
    const t = menos5(hour, minute);
    // se o horário é 00:00 a 00:04, o aviso cai no dia anterior
    const voltouDia = hour * 60 + minute < 5;
    const contentAviso = {
      title: 'Daqui a 5 minutos',
      body: `${med.name} às ${time}`,
      data: { medId: med.id, advance: true },
    };

    if (med.repetition.type === 'semanal') {
      for (const day of med.repetition.daysOfWeek) {
        await N.scheduleNotificationAsync({
          identifier: `${med.id}-${day}-${time}`,
          content,
          trigger: {
            type: N.SchedulableTriggerInputTypes.WEEKLY,
            weekday: day + 1,
            hour,
            minute,
            channelId: CHANNEL,
          },
        });

        if (avisar5) {
          const diaAviso = voltouDia ? (day + 6) % 7 : day;
          await N.scheduleNotificationAsync({
            identifier: `${med.id}-${day}-${time}-adv`,
            content: contentAviso,
            trigger: {
              type: N.SchedulableTriggerInputTypes.WEEKLY,
              weekday: diaAviso + 1,
              hour: t.hour,
              minute: t.minute,
              channelId: CHANNEL,
            },
          });

          await avisarAgora(N, med, nextWeekly(day, time));   // NOVO
        }
      }
    } else {
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

      if (avisar5) {
        await N.scheduleNotificationAsync({
          identifier: `${med.id}-${time}-adv`,
          content: contentAviso,
          trigger: {
            type: N.SchedulableTriggerInputTypes.DAILY,
            hour: t.hour,
            minute: t.minute,
            channelId: CHANNEL,
          },
        });

        await avisarAgora(N, med, nextOccurrence(time));   // NOVO
      }
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

export function menos5(hour: number, minute: number) {
  const total = (hour * 60 + minute - 5 + 1440) % 1440
  return { hour: Math.floor(total / 60), minute: total % 60 }
}

// Apaga notificações de remédios que não estão mais na lista
export async function limparNotificacoesOrfas(idsExistentes: string[]) {
  const N = getNotifications();
  if (!N) return;
  const all = await N.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((n) => {
        const id = n.content.data?.medId;
        return id && !idsExistentes.includes(String(id));
      })
      .map((n) => N.cancelScheduledNotificationAsync(n.identifier))
  );
}