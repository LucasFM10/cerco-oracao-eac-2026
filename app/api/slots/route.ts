import { redis } from '@/lib/redis';
import { NextResponse } from 'next/server';
import { generateSlots } from '@/lib/utils';
import { PrayerSlot } from '@/lib/types';

export async function GET() {
  try {
    const slots = generateSlots();
    const pipeline = redis.pipeline();
    
    slots.forEach((slot) => {
      pipeline.get(`slot:${slot.id}`);
    });

    const results = await pipeline.exec();
    
    if (!results) {
      return NextResponse.json(slots);
    }

    const populatedSlots = slots.map((slot, index) => {
      const result = results[index];
      const error = result[0];
      const dataStr = result[1] as string | null;

      if (error) {
        console.error(`Error fetching slot ${slot.id}:`, error);
        return slot;
      }

      if (dataStr) {
        try {
          const data = JSON.parse(dataStr);
          return { ...slot, ...data, id: slot.id, ocupado: !!data.ocupado };
        } catch (e) {
          console.error(`Error parsing slot ${slot.id}:`, e);
        }
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
    const existingStr = await redis.get(`slot:${id}`);
    if (existingStr) {
      const existing = JSON.parse(existingStr);
      if (existing.ocupado) {
        return NextResponse.json({ error: 'Slot already occupied' }, { status: 400 });
      }
    }

    const newSlotData = {
      ocupado: true,
      nome,
      celular,
      equipe,
    };

    await redis.set(`slot:${id}`, JSON.stringify(newSlotData));

    return NextResponse.json({ success: true, data: newSlotData });
  } catch (error) {
    console.error('Error updating slot:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
