import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { deepseek } from '@ai-sdk/deepseek';
import { generateText } from 'ai';
import { cache } from 'react';

// TODO: add a cache for the barbers
// TODO: it needs to have all the users messages (context window)
// Cache for barber data
let barberCache: any = null;
let barberCacheTime: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Function to get barbers with caching
async function getBarbers(providedBarbers?: any) {
  console.log('Getting barbers...');
  
  // If barbers are provided from frontend, use them
  if (providedBarbers && providedBarbers.length > 0) {
    console.log('Using barbers provided by frontend');
    
    // Ensure each barber has an appointments array
    const processedBarbers = providedBarbers.map(b => ({
      ...b,
      appointments: b.appointments || []
    }));
    
    return processedBarbers;
  }
  
  // Check if cache is valid
  const now = Date.now();
  if (barberCache && (now - barberCacheTime < CACHE_TTL)) {
    console.log('Using cached barber data');
    return barberCache;
  }
  
  // Fetch fresh data from database
  console.log('Fetching barbers from database...');
  const barbers = await prisma.barber.findMany({
    select: {
      id: true,
      name: true,
      specialties: true,
      experience: true,
      availability: true,
      appointments: {
        where: {
          startTime: { gte: new Date() },
          status: { not: 'cancelled' }
        },
        select: {
          startTime: true,
          endTime: true,
          status: true,
          serviceType: true
        }
      }
    },
  });
  
  // Update cache
  barberCache = barbers;
  barberCacheTime = now;
  console.log(`Cached ${barbers.length} barbers`);
  
  return barbers;
}

interface BookingDetails {
  date?: string;
  time?: string;
  barberId?: number;
  serviceType?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

interface BarberAvailability {
  [day: string]: { start: string; end: string } | null;
}

function cleanJsonString(str: string): string {
  console.log('Cleaning JSON string:', str);
  
  // Remove markdown formatting if present
  str = str.replace(/```json\n?|\n?```/g, '');
  
  // Remove comments
  str = str.replace(/\/\/.*$/gm, '');
  
  // Try to extract JSON object if there's explanatory text
  const jsonMatch = str.match(/(\{[\s\S]*\})/);
  if (jsonMatch) {
    str = jsonMatch[0];
  }
  
  // Clean up any remaining whitespace
  str = str.trim();
  
  console.log('Cleaned JSON string:', str);
  return str;
}

function getDayOfWeek(date: Date): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const day = days[date.getDay()];
  console.log(`Converting date ${date.toISOString()} to day of week: ${day}`);
  return day;
}

function isTimeInRange(time: string, start: string, end: string): boolean {
  console.log(`Checking if time ${time} is in range ${start}-${end}`);
  const [timeHour, timeMin] = time.split(':').map(Number);
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);
  
  const timeValue = timeHour * 60 + timeMin;
  const startValue = startHour * 60 + startMin;
  const endValue = endHour * 60 + endMin;
  
  const result = timeValue >= startValue && timeValue <= endValue;
  console.log(`Time check result: ${result}`);
  return result;
}

export async function POST(req: Request) {
  console.log('=== CHATBOT API CALLED ===');
  try {
    const { prompt, messages, conversationHistory, cachedBarbers } = await req.json();
    console.log('Received prompt:', prompt);
    console.log('Conversation history length:', conversationHistory?.length || 0);

    // Get barbers with caching
    const barbers = await getBarbers(cachedBarbers);
    console.log(`Using ${barbers.length} barbers for processing`);
    
    // Log barber appointment counts with null check
    barbers.forEach(b => {
      const appointmentCount = b.appointments ? b.appointments.length : 0;
      console.log(`Barber ${b.name} has ${appointmentCount} upcoming appointments`);
    });

    // Step 1: Detect intent
    console.log('Detecting intent...');
    const { text: intent } = await generateText({
      model: deepseek('deepseek-chat', {
        apiKey: process.env.DEEPSEEK_API_KEY || 'sk-6cc022f208e84c38bf2718bd6958b899', 
      }),
      messages: [
        {
          role: "system",
          content: `Classify the user's intent into one of these categories:
            - 'booking': User wants to book a new appointment
            - 'customer_info': User is providing customer information for a booking
            - 'rescheduling': User wants to change an existing appointment
            - 'cancellation': User wants to cancel an appointment
            - 'availability': User is asking about available times
            - 'general': General questions or other inquiries
            Return ONLY the category name.`
        },
        { role: "user", content: prompt }
      ]
    });
    console.log('Detected intent:', intent);

    // Check if user is providing customer information
    if (intent.trim().toLowerCase() === 'customer_info') {
      console.log('Processing customer info intent...');
      const { text: customerInfoResponse } = await generateText({
        model: deepseek('deepseek-chat'),
        messages: [
          {
            role: "system",
            content: `Extract customer information from the message. Return a JSON object with:
              {
                "customerName": string,
                "customerEmail": string,
                "customerPhone": string
              }
              Only include fields that are clearly provided.`
          },
          { role: "user", content: prompt }
        ]
      });
      console.log('Customer info response:', customerInfoResponse);

      try {
        const cleanedResponse = cleanJsonString(customerInfoResponse);
        const customerInfo = JSON.parse(cleanedResponse);
        console.log('Parsed customer info:', customerInfo);
        
        // Check if we have a pending booking in the session
        console.log('Checking for pending booking ID in conversation...');
        const pendingBookingId = await getPendingBookingId(messages);
        console.log('Pending booking ID:', pendingBookingId);
        
        if (!pendingBookingId) {
          console.log('No pending booking found');
          return NextResponse.json({
            recommendation: "I don't have a pending booking to update. Would you like to make a new appointment?",
            intent: 'customer_info_failed'
          });
        }

        // Update the appointment with customer info
        console.log(`Updating appointment ${pendingBookingId} with customer info...`);
        const appointment = await prisma.appointment.update({
          where: { id: pendingBookingId },
          data: {
            customerName: customerInfo.customerName || "Customer",
            customerEmail: customerInfo.customerEmail || "",
            customerPhone: customerInfo.customerPhone || "",
            status: 'confirmed'
          }
        });
        console.log('Appointment updated:', appointment);

        return NextResponse.json({
          recommendation: `Thank you! Your appointment has been confirmed. We'll send a confirmation to ${customerInfo.customerEmail || "your email"}.`,
          intent: 'booking_confirmed',
          appointment
        });
      } catch (error) {
        console.error('Customer info error:', error);
        return NextResponse.json({
          recommendation: "I couldn't process your information. Could you please provide your name, email, and phone number?",
          intent: 'customer_info_needed'
        });
      }
    } else if (intent.trim().toLowerCase() === 'booking') {
      console.log('Processing booking intent...');
      
      // Extract booking details
      const { text: bookingResponse } = await generateText({
        model: deepseek('deepseek-chat'),
        messages: [
          {
            role: "system",
            content: `Extract booking details from the user's message. Return a JSON object with these fields if mentioned:
              {
                "date": "YYYY-MM-DD",
                "time": "HH:mm",
                "barberId": number,
                "serviceType": string,
                "customerName": string,
                "customerEmail": string,
                "customerPhone": string
              }
              Available barbers: ${JSON.stringify(barbers.map(b => ({
                id: b.id,
                name: b.name,
                specialties: b.specialties
              })))}
              If the user mentions a barber by name but not ID, match it to the correct ID.
              If the user mentions a day of week instead of a date, convert it to the next occurrence of that day.
              The user might say something like, I need an appointment with John for tomorrow; that would mean the following day from today's day.
              Today's date is ${new Date().toISOString().split('T')[0]}.
              Be aggressive in extracting booking details - if the user is clearly trying to book, extract as much as possible.`
          },
          { role: "user", content: prompt },
          ...(conversationHistory || []).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))
        ]
      });
      
      console.log('Booking response:', bookingResponse);
      
      try {
        const cleanedResponse = cleanJsonString(bookingResponse);
        const bookingDetails = JSON.parse(cleanedResponse);
        console.log('Parsed booking details:', bookingDetails);
        
        // Check if we have enough information to create a booking
        const requiredFields = ['date', 'time', 'barberId', 'serviceType'];
        const missingFields = requiredFields.filter(field => !bookingDetails[field]);
        
        if (missingFields.length > 0) {
          console.log('Missing required booking fields:', missingFields);
          
          // If we're missing required fields, prompt for them
          let response = "I'd be happy to book your appointment! ";
          
          if (!bookingDetails.barberId) {
            response += "Which barber would you like to book with? ";
          } else {
            const barber = barbers.find(b => b.id === bookingDetails.barberId);
            if (barber) {
              response += `Great choice! ${barber.name} specializes in ${barber.specialties.join(', ')}. `;
            }
          }
          
          if (!bookingDetails.date || !bookingDetails.time) {
            response += "What date and time works for you? ";
          }
          
          if (!bookingDetails.serviceType) {
            response += "What service would you like (haircut, beard trim, etc.)? ";
          }
          
          return NextResponse.json({
            recommendation: response,
            intent: 'booking_needs_info',
            partialDetails: bookingDetails
          });
        }
        
        // We have all required fields, proceed with booking
        console.log('All required booking fields present, checking availability...');
        
        // Find the barber
        const barber = barbers.find(b => b.id === bookingDetails.barberId);
        if (!barber) {
          console.log('Barber not found');
          return NextResponse.json({
            recommendation: "I couldn't find that barber. Could you please choose from our available barbers?",
            intent: 'booking_failed'
          });
        }
        
        // Check barber availability for the requested day/time
        const startTime = new Date(`${bookingDetails.date}T${bookingDetails.time}`);
        const dayOfWeek = getDayOfWeek(startTime);
        const availability = barber.availability as BarberAvailability;
        
        if (!availability[dayOfWeek]) {
          console.log('Barber does not work on this day');
          return NextResponse.json({
            recommendation: `I'm sorry, ${barber.name} doesn't work on ${dayOfWeek}s. Would you like to choose another day?`,
            intent: 'booking_failed'
          });
        }
        
        // Check if the requested time is within working hours
        const workHours = availability[dayOfWeek];
        console.log('Work hours:', workHours);
        if (!workHours || !isTimeInRange(bookingDetails.time, workHours.start, workHours.end)) {
          console.log('Requested time is outside working hours');
          return NextResponse.json({
            recommendation: `${barber.name} works between ${workHours?.start} and ${workHours?.end} on ${dayOfWeek}s. Would you like a different time?`,
            intent: 'booking_failed'
          });
        }
        
        // After validating booking details and checking availability
        console.log('Creating pending appointment...');

        try {
          // Format the date and time for the database
          const startTime = new Date(`${bookingDetails.date}T${bookingDetails.time}`);
          const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour appointment
          
          // Check for conflicts
          const conflictingAppointments = barber.appointments.filter(apt => {
            const aptStart = new Date(apt.startTime);
            const aptEnd = new Date(apt.endTime);
            return (
              (startTime >= aptStart && startTime < aptEnd) || 
              (endTime > aptStart && endTime <= aptEnd) ||
              (startTime <= aptStart && endTime >= aptEnd)
            );
          });
          
          if (conflictingAppointments.length > 0) {
            console.log('Found conflicting appointment');
            // Handle conflict by suggesting alternative times
            // ...existing code...
          }
          
          // Create appointment with pending status
          console.log('No conflicts found, creating appointment');
          const appointment = await prisma.appointment.create({
            data: {
              startTime,
              endTime,
              barberId: bookingDetails.barberId,
              customerName: bookingDetails.customerName || "",
              customerEmail: bookingDetails.customerEmail || "",
              customerPhone: bookingDetails.customerPhone || "",
              serviceType: bookingDetails.serviceType || "Haircut",
              status: 'pending'
            }
          });
          
          console.log('Created pending appointment:', appointment);
          
          // Return response with appointment details
          return NextResponse.json({
            recommendation: `I've reserved your appointment with ${barber.name} for ${startTime.toLocaleString()} for a ${bookingDetails.serviceType}. To confirm, please provide your name, email, and phone number.`,
            intent: 'customer_info_needed',
            appointment: {
              id: appointment.id,
              startTime: appointment.startTime,
              endTime: appointment.endTime,
              barberId: appointment.barberId,
              serviceType: appointment.serviceType
            }
          });
        } catch (error) {
          console.error('Error creating appointment:', error);
          return NextResponse.json({
            recommendation: "I'm having trouble creating your appointment. Please try again.",
            intent: 'booking_failed'
          });
        }

      } catch (error) {
        console.error('Booking error:', error);
        return NextResponse.json({
          recommendation: "I'm having trouble processing your booking. Could you please try again with the barber's name, date, and time you'd like to book?",
          intent: 'booking_failed'
        });
      }
    } else if (intent.trim().toLowerCase() === 'rescheduling') {
      // Handle rescheduling logic
      return NextResponse.json({
        recommendation: "I can help you reschedule your appointment. Could you tell me your name and the date of your current appointment?",
        intent: 'rescheduling_needs_info'
      });
    } else if (intent.trim().toLowerCase() === 'cancellation') {
      // Handle cancellation logic
      return NextResponse.json({
        recommendation: "I can help you cancel your appointment. Could you please provide your name and the date of your appointment?",
        intent: 'cancellation_needs_info'
      });
    } else if (intent.trim().toLowerCase() === 'availability') {
      console.log('Processing availability check intent...');
      
      // Handle availability check with improved prompt
      const { text: availabilityResponse } = await generateText({
        model: deepseek('deepseek-chat'),
        messages: [
          {
            role: "system",
            content: `Extract availability query details from the user message. 
              Return ONLY a valid JSON object with these fields:
              {
                "barberId": number,
                "date": "YYYY-MM-DD"
              }
              
              Available barbers: ${JSON.stringify(barbers.map(b => ({
                id: b.id,
                name: b.name
              })))}
              
              If the user mentions a barber by name but not ID, match it to the correct ID.
              If the user mentions a day of week instead of a date, convert it to the next occurrence of that day.
              Do not include any explanatory text, only return the JSON object.`
          },
          { role: "user", content: prompt }
        ]
      });
      
      console.log('Availability response:', availabilityResponse);
      
      try {
        // Clean and parse the JSON response
        const cleanedResponse = cleanJsonString(availabilityResponse);
        let availabilityQuery;
        
        try {
          availabilityQuery = JSON.parse(cleanedResponse);
        } catch (parseError) {
          console.error('Failed to parse availability query:', parseError);
          console.log('Invalid JSON:', cleanedResponse);
          
          // Attempt to extract barber ID and date using regex as fallback
          const barberIdMatch = cleanedResponse.match(/"barberId"\s*:\s*(\d+)/);
          const dateMatch = cleanedResponse.match(/"date"\s*:\s*"([^"]+)"/);
          
          if (barberIdMatch && dateMatch) {
            console.log('Extracted data using regex:', barberIdMatch[1], dateMatch[1]);
            availabilityQuery = {
              barberId: parseInt(barberIdMatch[1]),
              date: dateMatch[1]
            };
          } else {
            // If regex extraction fails, return a helpful error message
            return NextResponse.json({
              recommendation: "I'm having trouble understanding which barber and date you're asking about. Could you please specify the barber's name and the date you're interested in?",
              intent: 'availability_needs_info'
            });
          }
        }
        
        console.log('Parsed availability query:', availabilityQuery);
        
        // Continue with the existing availability check logic...
      } catch (error) {
        console.error('Availability check error:', error);
        
        // Extract barber name and date from the original prompt using a more general approach
        const barberNames = barbers.map(b => b.name.toLowerCase());
        const mentionedBarber = barberNames.find(name => prompt.toLowerCase().includes(name));
        
        let response = "I'm having trouble checking availability. ";
        
        if (mentionedBarber) {
          const barber = barbers.find(b => b.name.toLowerCase() === mentionedBarber);
          if (barber) {
            response += `For ${barber.name}, `;
            
            // Include working days
            const availability = barber.availability as BarberAvailability;
            const workingDays = Object.entries(availability)
              .filter(([_, hours]) => hours !== null)
              .map(([day]) => day);
            
            if (workingDays.length > 0) {
              response += `they work on ${workingDays.join(', ')}. `;
            }
          }
        }
        
        response += "Could you please specify which barber and what date you're interested in?";
        
        return NextResponse.json({
          recommendation: response,
          intent: 'availability_failed'
        });
      }
    }

    // Handle general queries
    console.log('Processing general query...');
    const { text: response } = await generateText({
      model: deepseek('deepseek-chat'),
      messages: [
        {
          role: "system",
          content: `You are a helpful barber shop assistant. Help customers with their inquiries about our services, barbers, and booking process.
            Available barbers: ${JSON.stringify(barbers.map(b => ({
              name: b.name,
              specialties: b.specialties,
              experience: b.experience,
              availability: Object.entries(b.availability as BarberAvailability)
                .filter(([_, hours]) => hours !== null)
                .map(([day, hours]) => `${day}: ${hours?.start}-${hours?.end}`)
            })))}
            
            Services offered: Haircuts, Beard Trims, Shaves, Hair Styling, Color Services
            
            Booking process: Customers can book by specifying barber, date, time, and service.
            
            Keep responses friendly and concise.`
        },
        { role: "user", content: prompt }
      ]
    });
    console.log('General response:', response);

    return NextResponse.json({ 
      recommendation: response,
      intent: 'general'
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// Helper function to extract pending booking ID from conversation
async function getPendingBookingId(messages: any[]): Promise<number | null> {
  console.log('Looking for pending booking ID in messages...');
  // Look for the most recent message that might contain a pending booking ID
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    console.log(`Checking message ${i}:`, message.content);
    if (message.role === 'assistant' && message.content.includes('reserved your appointment')) {
      console.log('Found message with reserved appointment');
      // Extract appointment ID using regex or other means
      const match = message.content.match(/appointment_id:(\d+)/);
      if (match && match[1]) {
        const id = parseInt(match[1]);
        console.log('Extracted appointment ID:', id);
        return id;
      }
    }
  }
  console.log('No pending booking ID found');
  return null;
}
