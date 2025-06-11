import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const barberId = parseInt(params.id);
    if (isNaN(barberId)) {
      return NextResponse.json({ error: 'Invalid barber ID' }, { status: 400 });
    }

    const services = await prisma.service.findMany({
      where: {
        barberId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        duration: true,
        price: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ services });
  } catch (error) {
    console.error('Failed to fetch barber services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch barber services' },
      { status: 500 }
    );
  }
} 