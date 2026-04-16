import { PrayerSlot } from './types';

export const DAYS = ['sexta', 'sabado'] as const;
export type Day = (typeof DAYS)[number];

export const SLOTS_CONFIG = {
  sexta: {
    start: 7,
    end: 24, // 00:00 is represented as 24 or 0 on the next day
  },
  sabado: {
    start: 0,
    end: 7,
  },
};

export function generateSlots(): PrayerSlot[] {
  const slots: PrayerSlot[] = [];

  // Friday: 07:00 to 23:30
  for (let h = 7; h < 24; h++) {
    for (let m of ['00', '30']) {
      const time = `${h.toString().padStart(2, '0')}h${m}`;
      slots.push({
        id: `sexta_${time}`,
        ocupado: false,
        nome: '',
        celular: '',
        equipe: '',
      });
    }
  }

  // Saturday: 00:00 to 07:00
  for (let h = 0; h <= 7; h++) {
    for (let m of ['00', '30']) {
      // Don't include 07:30 on Saturday if we stop at 07:00
      if (h === 7 && m === '30') continue;
      
      const time = `${h.toString().padStart(2, '0')}h${m}`;
      slots.push({
        id: `sabado_${time}`,
        ocupado: false,
        nome: '',
        celular: '',
        equipe: '',
      });
    }
  }

  return slots;
}

export function formatSlotTime(id: string) {
  const [day, time] = id.split('_');
  return {
    day: day === 'sexta' ? 'Sexta (17/04)' : 'Sábado (18/04)',
    time: time.replace('h', ':'),
  };
}
