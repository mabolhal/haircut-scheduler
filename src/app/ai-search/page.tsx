'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  formType?: 'customer_info';
  formData?: any;
}

interface Appointment {
  id: number;
  startTime: Date;
  endTime: Date;
  barberId: number;
  serviceType: string;
}

const DEBUG = true;
function debug(...args: any[]) {
  if (DEBUG) console.log(...args);
}

export default function AISearchPage() {
  const [prompt, setPrompt] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I can help you book a barber appointment. Tell me which barber, service, date and time you\'d like.'
    }
  ]);
  const [pendingAppointment, setPendingAppointment] = useState<Appointment | null>(null);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [barbers, setBarbers] = useState<{id: number, name: string, specialties: string[]}[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch barbers only once on component mount
  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        // Check if we have cached barbers in localStorage
        const cachedData = localStorage.getItem('barberData');
        const cacheTime = localStorage.getItem('barberDataTime');
        
        if (cachedData && cacheTime) {
          const parsedData = JSON.parse(cachedData);
          const parsedTime = parseInt(cacheTime);
          const now = Date.now();
          
          // Use cache if it's less than 5 minutes old
          if (now - parsedTime < 5 * 60 * 1000) {
            debug('Using cached barber data from localStorage');
            
            // Make sure we're not sending too much data to the API
            const simplifiedBarbers = parsedData.map(b => ({
              id: b.id,
              name: b.name,
              specialties: b.specialties,
              experience: b.experience,
              availability: b.availability
              // Don't include appointments in the cached data
            }));
            
            setBarbers(simplifiedBarbers);
            return;
          }
        }
        
        // Fetch fresh data if cache is invalid or missing
        debug('Fetching barbers from API...');
        const response = await fetch('/api/barbers');
        if (response.ok) {
          const data = await response.json();
          
          // Store a simplified version of barbers
          const simplifiedBarbers = data.barbers.map(b => ({
            id: b.id,
            name: b.name,
            specialties: b.specialties,
            experience: b.experience,
            availability: b.availability
          }));
          
          setBarbers(simplifiedBarbers);
          debug('Fetched barbers:', simplifiedBarbers);
          
          // Cache the barber data
          localStorage.setItem('barberData', JSON.stringify(simplifiedBarbers));
          localStorage.setItem('barberDataTime', Date.now().toString());
        }
      } catch (error) {
        console.error('Failed to fetch barbers:', error);
      }
    };
    
    fetchBarbers();
  }, []);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Debug the appointment state
  useEffect(() => {
    debug('Current pending appointment:', pendingAppointment);
  }, [pendingAppointment]);

  const handleAISearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    debug('=== SENDING MESSAGE ===');
    debug('Prompt:', prompt);
    debug('Current messages:', messages);

    const userMessage: Message = { role: 'user', content: prompt };
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setChatLoading(true);

    try {
      debug('Sending request to chatbot API...');
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          messages,
          conversationHistory: messages.slice(-6), // Send last 6 messages for context
          cachedBarbers: barbers // Pass cached barber data to API
        }),
      });

      const data = await response.json();
      debug('Received response from chatbot API:', data);
      
      if (response.ok) {
        const aiMessage: Message = { 
          role: 'assistant', 
          content: data.recommendation 
        };
        setMessages(prev => [...prev, aiMessage]);
        debug('Added AI message to chat');

        // Handle different intents
        debug('Processing intent:', data.intent);
        if (data.intent === 'booking_confirmed') {
          debug('Handling booking_confirmed intent');
          // Clear any stored partial booking
          localStorage.removeItem('partialBooking');
          debug('Cleared partial booking from storage');
          
          // No need to show form if already confirmed
          if (data.appointment) {
            debug('Appointment already confirmed, hiding form');
            setPendingAppointment(null);
          }
        } else if (data.intent === 'customer_info_needed') {
          debug('Handling customer_info_needed intent');
          
          // Make sure we have an appointment object
          if (!data.appointment || !data.appointment.id) {
            debug('No appointment data received from API');
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: 'Sorry, there was a problem creating your appointment. Please try again.'
            }]);
            return;
          }
          
          // Store the appointment data
          debug('Setting pending appointment:', data.appointment);
          setPendingAppointment(data.appointment);
          
          // Add customer info form to the chat
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'Please provide your contact information to confirm the appointment:',
            formType: 'customer_info',
            formData: {
              appointmentId: data.appointment.id
            }
          }]);
          
          // Also add hidden appointment ID to the previous message for reference
          const updatedMessage = {
            ...aiMessage,
            content: aiMessage.content + ` (appointment_id:${data.appointment.id})`
          };
          debug('Adding appointment ID to message:', updatedMessage);
          
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 2] = updatedMessage;
            return newMessages;
          });
        } else if (data.intent === 'availability_response' && data.availableSlots) {
          debug('Handling availability_response intent');
          // Format available slots in a more readable way
          const slotsMessage = {
            role: 'assistant',
            content: 'Available times: ' + data.availableSlots.join(', ')
          };
          debug('Adding available slots message:', slotsMessage);
          setMessages(prev => [...prev, slotsMessage]);
        }
      } else {
        console.error('Chat error:', data.error);
        debug('Error in chat response:', data.error);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.'
        }]);
      }
    } catch (error) {
      console.error('Failed to get recommendation:', error);
      debug('Exception during API call:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setChatLoading(false);
      debug('Chat loading completed');
    }
  };

  // Update the customer info form submission handler
  const handleCustomerInfoFormSubmit = (info: any) => {
    debug('=== SUBMITTING CUSTOMER INFO VIA FORM ===');
    debug('Contact info:', info);
    
    if (!info.name || !info.email) {
      debug('Missing required contact information');
      return;
    }
    
    // Create a natural language message from the form data
    const customerInfoMessage = `My name is ${info.name}, my email is ${info.email}${info.phone ? `, and my phone number is ${info.phone}` : ''}.`;
    debug('Customer info message:', customerInfoMessage);
    
    // Set the message and submit
    setPrompt(customerInfoMessage);
    setTimeout(() => {
      handleAISearch(new Event('submit') as any);
    }, 100);
  };

  // Handle direct confirmation via API
  const handleConfirmBooking = async () => {
    if (!pendingAppointment) {
      debug('No pending appointment to confirm');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I don\'t have a pending booking to update. Would you like to make a new appointment?'
      }]);
      return;
    }
    
    debug('=== CONFIRMING BOOKING VIA API ===');
    debug('Pending appointment ID:', pendingAppointment.id);
    debug('Contact info:', contactInfo);
    
    if (!contactInfo.name || !contactInfo.email) {
      debug('Missing required contact information');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Please provide your name and email to confirm the booking.'
      }]);
      return;
    }
    
    try {
      // Update the appointment with contact info
      debug('Sending update request to appointments API...');
      const response = await fetch(`/api/appointments/${pendingAppointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: contactInfo.name,
          customerEmail: contactInfo.email,
          customerPhone: contactInfo.phone || '',
          status: 'confirmed'
        }),
      });

      const data = await response.json();
      debug('Received response from appointments API:', data);

      if (response.ok) {
        debug('Appointment confirmed successfully');
        setPendingAppointment(null);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Thank you, ${contactInfo.name}! Your appointment has been confirmed. We'll send a confirmation to ${contactInfo.email}.`
        }]);
      } else {
        debug('Failed to confirm appointment:', data.error);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Sorry, I had trouble confirming your appointment: ${data.error || 'Unknown error'}. Please try again.`
        }]);
      }
    } catch (error) {
      console.error('Failed to confirm booking:', error);
      debug('Exception during confirmation:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was a problem confirming your appointment. Please try again.'
      }]);
    }
  };

  // Update the renderForm function to include a submit button
  const renderForm = (message: Message) => {
    if (message.formType === 'customer_info') {
      return (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-2">
          <h4 className="font-medium text-blue-800 mb-3">Contact Information</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                className="w-full p-2 border rounded"
                value={contactInfo.name}
                onChange={(e) => setContactInfo(prev => ({
                  ...prev, 
                  name: e.target.value
                }))}
                placeholder="Full Name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input 
                type="email"
                className="w-full p-2 border rounded"
                value={contactInfo.email}
                onChange={(e) => setContactInfo(prev => ({
                  ...prev, 
                  email: e.target.value
                }))}
                placeholder="email@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input 
                type="tel"
                className="w-full p-2 border rounded"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo(prev => ({
                  ...prev, 
                  phone: e.target.value
                }))}
                placeholder="(123) 456-7890"
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleCustomerInfoFormSubmit(contactInfo)}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                disabled={!contactInfo.name || !contactInfo.email}
              >
                Submit Information
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  // Add this near the top of the component
  const testBookingFlow = () => {
    debug('Testing booking flow...');
    setPrompt("I'd like to book a haircut with the first available barber tomorrow at 2pm");
    handleAISearch(new Event('submit') as any);
  };

  // Add a debug button to the UI (only in development)
  {process.env.NODE_ENV === 'development' && (
    <button 
      onClick={testBookingFlow}
      className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded text-sm"
    >
      Test Booking
    </button>
  )}

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">AI Barber Assistant</h1>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div key={index}>
                <div
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs sm:max-w-sm md:max-w-md p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {/* Hide appointment ID from display */}
                    {message.content.replace(/ \(appointment_id:\d+\)/, '')}
                  </div>
                </div>
                
                {/* Render form if present */}
                {message.formType && renderForm(message)}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="border-t p-4">
            <form onSubmit={handleAISearch} className="flex space-x-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="I'd like to book a haircut with John at 3pm tomorrow..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={chatLoading}
              />
              <button
                type="submit"
                disabled={chatLoading || !prompt.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              >
                {chatLoading ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 