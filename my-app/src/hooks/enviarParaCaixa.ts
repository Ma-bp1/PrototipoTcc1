import { doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export type TipoAlerta = "led" | "buzzer" | "ambos" | "nenhum";

export interface Medicamento {
  slot: number;
  nome: string;
  horarios: string[]; // ex: ["08:00", "20:00"]
  dose: number;
  quantidade: number;
  minimo: number;
  alerta: TipoAlerta;
}

export interface AgendaItem {
  s: number;
  n: string;
  h: number;
  m: number;
  d: number;
  q: number;
  min: number;
  led: boolean;
  buzzer: boolean;
}

export async function enviarParaCaixa(boxId: string, medicamentos: Medicamento[]): Promise<void> {
  const agenda: AgendaItem[] = [];

  medicamentos.forEach((med) => {
    med.horarios.forEach((hhmm) => {
      const [h, m] = hhmm.split(":").map(Number);
      agenda.push({
        s: med.slot,                        // 1 a 6
        n: med.nome,
        h, 
        m,
        d: med.dose,
        q: med.quantidade,                  // usado só no cadastro ou reabastecimento
        min: med.minimo,
        led: med.alerta === "led" || med.alerta === "ambos",
        buzzer: med.alerta === "buzzer" || med.alerta === "ambos",
        // resetQtd: true,                  // use só ao reabastecer
      });
    });
  });

  await setDoc(
    doc(db, "boxes", boxId.trim().toUpperCase()),
    {
      agendaJson: JSON.stringify(agenda),   // texto, não array
      agendaAt: String(Date.now()),         // muda a cada envio
    },
    { merge: true }
  );
}