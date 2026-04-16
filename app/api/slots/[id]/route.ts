import { redis } from '@/lib/redis';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existingStr = await redis.get(`slot:${id}`);
    if (!existingStr) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }

    const existing = JSON.parse(existingStr);
    const updatedData = {
      ...existing,
      ...body,
      ocupado: body.ocupado ?? existing.ocupado,
    };

    await redis.set(`slot:${id}`, JSON.stringify(updatedData));

    return NextResponse.json({ success: true, data: updatedData });
  } catch (error) {
    console.error('Error patching slot:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // "Liberar" means clearing data
    await redis.del(`slot:${id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting slot:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
