import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const barberId = parseInt(localStorage.getItem('barberId') || '0'); // Get the barber ID from local storage
    const { unavailableTimes } = await request.json();
    
    // Update the barber's availability in the database
    await prisma.barber.update({
      where: { id: barberId },
      data: {
        availability: {
          // Logic to mark the specified times as unavailable
          // This could involve updating a JSON field or a related table
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating unavailable times:', error);
    return NextResponse.json({ error: 'Failed to update unavailable times' }, { status: 500 });
  }
} 