import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('=== APPOINTMENTS API CALLED ===');
  console.log('Appointment ID:', params.id);
  
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      console.log('Invalid appointment ID');
      return NextResponse.json({ error: 'Invalid appointment ID' }, { status: 400 });
    }

    // First check if the appointment exists
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!existingAppointment) {
      console.log('Appointment not found');
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const data = await request.json();
    console.log('Update data:', data);
    
    // Update the appointment
    console.log('Updating appointment in database...');
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: data.status || 'confirmed',
        customer: {
          update: {
            name: data.customerName,
            email: data.customerEmail,
            phone: data.customerPhone || ''
          }
        }
      },
      include: {
        customer: true
      }
    });
    console.log('Appointment updated:', appointment);

    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    console.error('Failed to update appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
} 