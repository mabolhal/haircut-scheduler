import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { startTime, endTime, customerName, customerEmail, customerPhone, serviceType } = data;

    const appointment = await prisma.appointment.create({
      data: {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        customerName,
        customerEmail,
        customerPhone,
        serviceType,
        barberId: 1, // Assuming we're using the first barber for now
        status: 'pending'
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Appointment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const barberId = searchParams.get('barberId');

  console.log('Fetching appointments for barberId:', barberId);

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        barberId: barberId ? parseInt(barberId) : undefined,
        startTime: {
          gte: new Date(),
        },
        status: 'confirmed',
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
      },
    });

    console.log('Found appointments:', appointments);
    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
} 