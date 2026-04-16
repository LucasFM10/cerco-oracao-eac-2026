import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import { generateSlots } from '@/lib/utils';
import { PrayerSlot } from '@/lib/types';

export async function GET() {
  try {
    const slots = generateSlots();
    const pipeline = kv.pipeline();
    
    slots.forEach((slot) => {
      pipeline.get(`slot:${slot.id}`);
    });

    const results = await pipeline.exec();
    
    const populatedSlots = slots.map((slot, index) => {
      const data = results[index] as Partial<PrayerSlot> | null;
      if (data) {
        return { ...slot, ...data, id: slot.id, ocupado: !!data.ocupado };
      }
      return slot;
    });

    return NextResponse.json(populatedSlots);
  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { id, nome, celular, equipe } = await request.json();

    if (!id || !nome || !celular || !equipe) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Check if occupied
    const existing = await kv.get(`slot:${id}`) as any;
    if (existing?.ocupado) {
      return NextResponse.json({ error: 'Slot already occupied' }, { status: 400 });
    }

    const newSlotData = {
      ocupado: true,
      nome,
      celular,
      equipe,
    };

    await kv.set(`slot:${id}`, newSlotData);

    return NextResponse.json({ success: true, data: newSlotData });
  } catch (error) {
    console.error('Error updating slot:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
