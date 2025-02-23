import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface BookingDetails {
  barberId: number;
  startTime: Date;
  endTime: Date;
  customerName: string;
  serviceType: string;
}

export async function POST(req: Request) {
  try {
    const { prompt, messages } = await req.json();

    // Step 1: Detect intent
    const intentResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-r1:1.5b',
        prompt: `<think>You are an intent classifier. Classify this user input:
                "booking" - For booking/scheduling requests
                "time_query" - For availability questions
                "general" - For general questions
                Return ONLY the category.</think>
                
                User input: ${prompt}`,
        stream: false,
      }),
    });

    const intentData = await intentResponse.json();
    const intent = intentData.response.trim().toLowerCase();

    // Fetch barbers for context
    const barbers = await prisma.barber.findMany({
      select: {
        id: true,
        name: true,
        specialties: true,
        experience: true,
        availability: true,
      },
    });

    if (intent === 'booking') {
      const timeResponse = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-r1:1.5b',
          prompt: `<think>Extract booking details in JSON format or return "NO_TIME":
                  {
                    "date": "YYYY-MM-DD",
                    "time": "HH:mm",
                    "barberId": number,
                    "serviceType": "string"
                  }</think>
                  
                  Text: ${prompt}`,
          stream: false,
        }),
      });

      const timeData = await timeResponse.json();
      let bookingDetails: BookingDetails | null = null;

      try {
        bookingDetails = JSON.parse(timeData.response.trim());
      } catch {
        return NextResponse.json({
          recommendation: "I can help you book an appointment. Please specify a date, time, and the type of service you'd like.",
          intent: 'booking_needs_time'
        });
      }

      if (bookingDetails) {
        // Create the appointment in the database
        const startTime = new Date(`${bookingDetails.date}T${bookingDetails.time}`);
        const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 minutes later

        try {
          const appointment = await prisma.appointment.create({
            data: {
              startTime,
              endTime,
              barberId: bookingDetails.barberId,
              customerName: "Customer", // You might want to get this from the user
              customerEmail: "customer@example.com", // Get from user
              customerPhone: "", // Get from user
              serviceType: bookingDetails.serviceType,
              status: 'pending'
            }
          });

          return NextResponse.json({
            recommendation: `Great! I've booked your appointment for ${startTime.toLocaleString()}. Would you like to provide your contact details?`,
            intent: 'booking_confirmed',
            appointment: appointment
          });
        } catch (error) {
          return NextResponse.json({
            recommendation: "I couldn't book that time slot. It might be already taken. Would you like to try a different time?",
            intent: 'booking_failed'
          });
        }
      }
    }

    // Handle general queries
    const generalResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-r1:1.5b',
        prompt: `<think>You are a helpful barber assistant. Available barbers: ${JSON.stringify(barbers)}</think>

                User: ${prompt}

                Assistant: Let me help you with that!`,
        stream: false,
      }),
    });

    const data = await generalResponse.json();
    // Remove any text between <think> tags
    const cleanedResponse = data.response.replace(/<think>.*?<\/think>/gs, '').trim();
    
    return NextResponse.json({ 
      recommendation: cleanedResponse,
      intent: 'general'
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}