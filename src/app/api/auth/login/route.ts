import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

type ErrorWithMessage = Error & {
  message: string;
  code?: string;
};

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const barber = await prisma.barber.findUnique({
      where: { email },
    });

    if (!barber) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, barber.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Successful login
    return NextResponse.json({ 
      success: true, 
      barberId: barber.id,
      barberName: barber.name 
    });
  } catch (error) {
    const err = error as ErrorWithMessage;
    console.error('Login error:', err);
    return NextResponse.json({ error: err.message || 'Login failed' }, { status: 500 });
  }
} 