import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Received signup data:', data); // Debug log
    
    // Validate required fields
    if (!data.email || !data.password || !data.name) {
      console.log('Missing fields:', { email: !!data.email, password: !!data.password, name: !!data.name });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    console.log('Password hashed successfully'); // Debug log

    try {
      const barber = await prisma.barber.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          phone: data.phone || '',
          experience: Number(data.experience) || 0,
          specialties: data.specialties || [],
          bio: data.bio || '',
          languages: data.languages || [],
          certificates: data.certificates || [],
          priceHaircut: Number(data.priceHaircut) || 0,
          priceBeard: Number(data.priceBeard) || 0,
          priceBoth: Number(data.priceBoth) || 0,
          availability: data.availability || {
            monday: { start: "09:00", end: "17:00" },
            tuesday: { start: "09:00", end: "17:00" },
            wednesday: { start: "09:00", end: "17:00" },
            thursday: { start: "09:00", end: "17:00" },
            friday: { start: "09:00", end: "17:00" },
            saturday: null,
            sunday: null
          }
        },
      });
      console.log('Barber created successfully:', barber.id); // Debug log

      const { password, ...barberWithoutPassword } = barber;
      return NextResponse.json({ barber: barberWithoutPassword });
    } catch (dbError: any) {
      console.error('Database error:', dbError); // Log the entire error object
      return NextResponse.json(
        { error: 'Database operation failed' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Signup error:', error); // Log the error
    return NextResponse.json(
      { error: error.message || 'Failed to create barber account' },
      { status: 500 }
    );
  }
} 