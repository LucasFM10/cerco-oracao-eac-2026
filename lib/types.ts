export interface PrayerSlot {
  id: string; // e.g. "sexta_07h00"
  ocupado: boolean;
  nome: string;
  celular: string;
  equipe: string;
}

export type SlotKey = `slot:${string}`;
