import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const barbers = await prisma.barber.findMany({
      select: {
        id: true,
        name: true,
        imageUrl: true,
        rating: true,
        specialties: true,
        experience: true,
      },
    });

    return NextResponse.json({ barbers });
  } catch (error: any) {
    console.error('Database error:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });

    if (error.code === 'P2021') {
      return NextResponse.json(
        { error: 'Database table not found' },
        { status: 500 }
      );
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Unique constraint failed' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Database error', details: error.message },
      { status: 500 }
    );
  }
} 