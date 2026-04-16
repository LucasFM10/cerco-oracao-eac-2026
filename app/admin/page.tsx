'use client';

import { useEffect, useState } from 'react';
import { PrayerSlot } from '@/lib/types';
import { Loader2, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { Dialog } from '@/components/Dialog';

export default function AdminPage() {
  const [slots, setSlots] = useState<PrayerSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlot, setEditingSlot] = useState<PrayerSlot | null>(null);
  const [formData, setFormData] = useState({ nome: '', celular: '', equipe: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, []);

  async function fetchSlots() {
    setLoading(true);
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

  async function handleRelease(id: string) {
    if (!confirm('Tem certeza que deseja liberar este horário? Dados serão apagados.')) return;

    try {
      const res = await fetch(`/api/slots/${id}`, { method: 'DELETE' });
      if (res.ok) fetchSlots();
    } catch (error) {
      alert('Erro ao liberar');
    }
  }

  function handleEdit(slot: PrayerSlot) {
    setEditingSlot(slot);
    setFormData({ 
      nome: slot.nome || '', 
      celular: slot.celular || '', 
      equipe: slot.equipe || '' 
    });
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSlot) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/slots/${editingSlot.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, ocupado: true }),
      });

      if (res.ok) {
        setEditingSlot(null);
        fetchSlots();
      }
    } catch (error) {
      alert('Erro ao atualizar');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
            <p className="text-gray-500 mt-1">Gerenciamento completo da escala de oração</p>
          </div>
          <button 
            onClick={fetchSlots}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Atualizar
          </button>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Horário</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">WhatsApp</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Equipe</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {slots.map(slot => (
                    <tr key={slot.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-gray-700">
                          {slot.id.split('_')[0].charAt(0).toUpperCase() + slot.id.split('_')[0].slice(1)} {slot.id.split('_')[1].replace('h', ':')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${slot.ocupado ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
                          {slot.ocupado ? 'Ocupado' : 'Livre'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 font-medium">{slot.nome || '--'}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{slot.celular || '--'}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600 font-medium italic">
                          {slot.equipe || '--'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(slot)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          {slot.ocupado && (
                            <button 
                              onClick={() => handleRelease(slot.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Liberar"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog 
        isOpen={!!editingSlot} 
        onClose={() => setEditingSlot(null)} 
        title="Editar Horário"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input 
              value={formData.nome}
              onChange={e => setFormData({...formData, nome: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
            <input 
              value={formData.celular}
              onChange={e => setFormData({...formData, celular: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Equipe</label>
            <input 
              value={formData.equipe}
              onChange={e => setFormData({...formData, equipe: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button 
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {submitting ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </Dialog>
    </main>
  );
}
