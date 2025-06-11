import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const barberId = searchParams.get('barberId');

    if (!barberId) {
      return NextResponse.json({ 
        success: false,
        error: 'Barber ID is required',
        appointments: [] 
      }, { status: 400 });
    }

    const parsedBarberId = parseInt(barberId);
    if (isNaN(parsedBarberId)) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid barber ID format',
        appointments: [] 
      }, { status: 400 });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        barberId: parsedBarberId,
        startTime: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        serviceType: true,
        barberId: true,
        status: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      appointments: appointments || []
    });

  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch appointments',
      appointments: []
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { 
      startTime, 
      endTime, 
      customerName, 
      customerEmail, 
      customerPhone, 
      serviceType,
      barberId
    } = body;

    // Validate required fields
    const missingFields = [];
    if (!startTime) missingFields.push('startTime');
    if (!endTime) missingFields.push('endTime');
    if (!customerName) missingFields.push('customerName');
    if (!customerEmail) missingFields.push('customerEmail');
    if (!customerPhone) missingFields.push('customerPhone');
    if (!serviceType) missingFields.push('serviceType');
    if (!barberId) missingFields.push('barberId');

    if (missingFields.length > 0) {
      return NextResponse.json({ 
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        appointment: null
      }, { status: 400 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        customerName,
        customerEmail,
        customerPhone,
        serviceType,
        barberId: parseInt(barberId.toString()),
        status: 'confirmed'
      },
    });

    return NextResponse.json({
      success: true,
      appointment,
      error: null
    });

  } catch (error) {
    console.error('Failed to create appointment:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create appointment',
      appointment: null
    }, { status: 500 });
  }
} 