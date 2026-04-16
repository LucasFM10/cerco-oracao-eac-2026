import { PrayerSlot } from '@/lib/types';
import { formatSlotTime } from '@/lib/utils';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SlotCardProps {
  slot: PrayerSlot;
  onClick: (slot: PrayerSlot) => void;
  isAdmin?: boolean;
}

export function SlotCard({ slot, onClick, isAdmin }: SlotCardProps) {
  const { time } = formatSlotTime(slot.id);

  return (
    <button
      onClick={() => onClick(slot)}
      disabled={!isAdmin && slot.ocupado}
      className={cn(
        "group relative flex flex-col p-4 rounded-xl border-2 transition-all duration-200 text-left w-full",
        slot.ocupado 
          ? "bg-gray-50 border-gray-100 cursor-default opacity-80" 
          : "bg-white border-blue-50 hover:border-blue-500 hover:shadow-md active:scale-[0.98]"
      )}
    >
      <span className="text-sm font-medium text-gray-500 mb-1">{time}</span>
      <div className="flex items-center justify-between">
        <span className={cn(
          "font-bold text-lg",
          slot.ocupado ? "text-gray-400" : "text-gray-900"
        )}>
          {slot.ocupado ? (isAdmin ? slot.nome : "Preenchido") : "Disponível"}
        </span>
        {!slot.ocupado && (
          <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wider group-hover:bg-blue-600 group-hover:text-white transition-colors">
            Rezar
          </span>
        )}
      </div>
      {slot.ocupado && slot.equipe && (
        <span className="text-xs text-gray-400 mt-1">{slot.equipe}</span>
      )}
    </button>
  );
}
