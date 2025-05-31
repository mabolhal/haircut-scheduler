import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth.config';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ barberId: null });
    }

    return NextResponse.json({ 
      barberId: session.user.id,
      barberName: session.user.name,
      barberEmail: session.user.email
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ barberId: null });
  }
} 