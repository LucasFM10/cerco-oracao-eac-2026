'use client';

import { useEffect, useState } from 'react';
import { PrayerSlot } from '@/lib/types';
import { SlotCard } from '@/components/SlotCard';
import { Dialog } from '@/components/Dialog';
import { Heart, Loader2 } from 'lucide-react';

const EQUIPES = [
  "Tráfego",
  "Círculos",
  "Mídia e Comunicação",
  "Sacerdócio",
  "Cantos",
  "Estrutura",
  "Cozinha"
];

export default function LandingPage() {
  const [slots, setSlots] = useState<PrayerSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<PrayerSlot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDay, setActiveDay] = useState<'sexta' | 'sabado'>('sexta');

  // Form state
  const [formData, setFormData] = useState({ nome: '', celular: '', equipe: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, []);

  async function fetchSlots() {
    try {
      const res = await fetch('/api/slots');
      const data = await res.json();
      if (Array.isArray(data)) {
        setSlots(data);
      } else {
        console.error('API did not return an array:', data);
      }
    } catch (error) {
      console.error('Failed to fetch slots');
    } finally {
      setLoading(false);
    }
  }

  function handleSlotClick(slot: PrayerSlot) {
    if (slot.ocupado) return;
    setSelectedSlot(slot);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: selectedSlot.id }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ nome: '', celular: '', equipe: '' });
        fetchSlots(); // Refresh
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao registrar');
      }
    } catch (error) {
      alert('Erro de conexão');
    } finally {
      setSubmitting(false);
    }
  }

  const filteredSlots = slots.filter(s => s.id.startsWith(activeDay));

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Header */}
      <header className="bg-white border-b px-6 py-8 text-center sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
              <Heart className="fill-current" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">EAC PSPP 2026</h1>
          <p className="text-gray-500 mt-2 font-medium">Relógio de 24 Horas de Oração</p>
        </div>
      </header>

      {/* Day Selector */}
      <div className="max-w-4xl mx-auto px-6 mt-8">
        <div className="flex p-1 bg-gray-200/50 rounded-xl mb-8">
          <button 
            onClick={() => setActiveDay('sexta')}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeDay === 'sexta' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Sexta (17/04)
          </button>
          <button 
            onClick={() => setActiveDay('sabado')}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeDay === 'sabado' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Sábado (18/04)
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-medium">Carregando horários...</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border-2 border-dashed border-gray-100">
            <p className="font-medium">Nenhum horário disponível no momento.</p>
            <p className="text-sm">Verifique se as variáveis do banco de dados estão configuradas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSlots.map(slot => (
              <SlotCard key={slot.id} slot={slot} onClick={handleSlotClick} />
            ))}
          </div>
        )}
      </div>

      {/* Registration Modal */}
      <Dialog 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Confirmar Horário"
      >
        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
            <p className="text-sm text-blue-800 font-medium">
              Você está selecionando o horário das <span className="font-bold underline">
                {selectedSlot?.id.split('_')[1].replace('h', ':')}
              </span> de {activeDay === 'sexta' ? 'sexta-feira' : 'sábado'}.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">Nome Completo</label>
            <input 
              required
              type="text"
              placeholder="Ex: João Silva"
              value={formData.nome}
              onChange={e => setFormData({...formData, nome: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">Celular (com DDD)</label>
            <input 
              required
              type="tel"
              placeholder="(00) 00000-0000"
              value={formData.celular}
              onChange={e => setFormData({...formData, celular: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">Sua Equipe</label>
            <select 
              required
              value={formData.equipe}
              onChange={e => setFormData({...formData, equipe: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
            >
              <option value="">Selecione uma equipe</option>
              {EQUIPES.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl mt-4 shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="animate-spin" size={20} /> : "Confirmar Minha Oração"}
          </button>
        </form>
      </Dialog>
    </main>
  );
}
