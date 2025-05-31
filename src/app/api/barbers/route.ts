import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    console.log('Fetching barbers for API endpoint');
    const barbers = await prisma.barber.findMany({
      select: {
        id: true,
        name: true,
        specialties: true,
        experience: true,
        availability: true,
        // Include appointments but we'll filter them out before returning
        appointments: {
          where: {
            startTime: { gte: new Date() },
            status: { not: 'cancelled' }
          },
          select: {
            id: true,
            startTime: true,
            endTime: true
          }
        }
      },
    });

    // Create a simplified version for the frontend
    const simplifiedBarbers = barbers.map(b => ({
      id: b.id,
      name: b.name,
      specialties: b.specialties,
      experience: b.experience,
      availability: b.availability
      // Don't include appointments in the response
    }));

    // Set cache headers to allow caching for 5 minutes
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=300'); // 300 seconds = 5 minutes

    return NextResponse.json(
      { barbers: simplifiedBarbers },
      { 
        headers,
        status: 200 
      }
    );
  } catch (error) {
    console.error('Failed to fetch barbers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch barbers' },
      { status: 500 }
    );
  }
} 