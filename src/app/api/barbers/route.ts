import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const barbers = await prisma.barber.findMany({
      select: {
        id: true,
        name: true,
        experience: true,
        specialties: true,
        imageUrl: true,
      },
    });

    return NextResponse.json({ barbers });
  } catch (error) {
    console.error('Failed to fetch barbers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch barbers' },
      { status: 500 }
    );
  }
} 