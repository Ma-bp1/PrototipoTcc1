import AsyncStorage from '@react-native-async-storage/async-storage';

export type AlertSettings = {
  medAlert: boolean; // notificações dos medicamentos
  lowStock: boolean; // (ainda sem efeito: falta a lógica de estoque)
  timeConflict: boolean; // avisar conflito de horário ao salvar
  slotConflict: boolean; // avisar conflito de slot ao salvar
  vibration: boolean; // vibrar na tela de alerta da dose
  sound: boolean; // alertas da caixa (sem efeito por enquanto)
  light: boolean; // alertas da caixa (sem efeito por enquanto)
};

export const DEFAULT_ALERT_SETTINGS: AlertSettings = {
  medAlert: true,
  lowStock: true,
  timeConflict: true,
  slotConflict: true,
  vibration: false,
  sound: true,
  light: true,
};

const KEY = 'alertSettings:v1';

// Cache em memória: leituras seguintes (agendador, DoseAlert) não vão ao disco
let cache: AlertSettings | null = null;

export async function getAlertSettings(): Promise<AlertSettings> {
  if (cache) return cache;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    // mescla com os padrões para aceitar chaves novas no futuro
    cache = { ...DEFAULT_ALERT_SETTINGS, ...(raw ? JSON.parse(raw) : {}) };
  } catch (e) {
    console.warn('Falha ao ler configurações de alerta', e);
    cache = { ...DEFAULT_ALERT_SETTINGS };
  }
  return cache!;
}

export async function saveAlertSettings(settings: AlertSettings) {
  cache = settings; // atualiza antes de gravar: quem ler em seguida já vê o valor novo
  await AsyncStorage.setItem(KEY, JSON.stringify(settings));
}