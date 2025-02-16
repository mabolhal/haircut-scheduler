import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  context: {
    barberId: any; params: Promise<{ barberId: string }> 
}
) {
  try {
    // const params = await context.params;
    const barberId = (context).barberId;
    
    const appointments = await prisma.appointment.findMany({
      where: {
        barberId,
        status: 'confirmed',
        startTime: {
          gte: new Date(), // Only get future appointments
        },
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        barberId: true,
        status: true,
      },
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}
