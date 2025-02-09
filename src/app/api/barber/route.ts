import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  console.log('Received ID:', id, 'Type:', typeof id);

  try {
    const parsedId = parseInt(id || '');
    if (isNaN(parsedId)) {
      return NextResponse.json({ error: 'Invalid barber ID' }, { status: 400 });
    }

    const barber = await prisma.barber.findUnique({
      where: { id: parsedId },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        rating: true,
        specialties: true,
        experience: true,
        bio: true,
        languages: true,
        certificates: true,
        availability: true,
      },
    });

    if (!barber) {
      return NextResponse.json({ error: 'Barber not found' }, { status: 404 });
    }

    return NextResponse.json({ barber });
  } catch (error) {
    console.error('Failed to fetch barber:', error);
    return NextResponse.json({ error: 'Failed to fetch barber' }, { status: 500 });
  }
} 