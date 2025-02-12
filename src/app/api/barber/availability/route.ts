import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const barberId = 1; // Replace with the actual barber ID
    const barber = await prisma.barber.findUnique({
      where: { id: barberId },
      select: { availability: true },
    });

    return NextResponse.json({ availability: barber?.availability });
  } catch (error: any) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
} 