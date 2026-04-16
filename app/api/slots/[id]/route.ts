import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    const existing = await kv.get(`slot:${id}`) as any;
    if (!existing) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }

    const updatedData = {
      ...existing,
      ...body,
      ocupado: body.ocupado ?? existing.ocupado,
    };

    await kv.set(`slot:${id}`, updatedData);

    return NextResponse.json({ success: true, data: updatedData });
  } catch (error) {
    console.error('Error patching slot:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // "Liberar" means clearing data and setting ocupado to false
    await kv.del(`slot:${id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting slot:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
