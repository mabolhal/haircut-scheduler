'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Appointment {
  id: number;
  startTime: Date;
  endTime: Date;
  barberId: number;
  serviceType: string;
}

export default function AISearchPage() {
  const [prompt, setPrompt] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I can help you find the perfect barber. What kind of haircut are you looking for?'
    }
  ]);
  const [pendingAppointment, setPendingAppointment] = useState<Appointment | null>(null);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const router = useRouter();

  const handleAISearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userMessage: Message = { role: 'user', content: prompt };
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setChatLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          messages 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const aiMessage: Message = { 
          role: 'assistant', 
          content: data.recommendation 
        };
        setMessages(prev => [...prev, aiMessage]);

        // Handle booking flow
        if (data.intent === 'booking_needs_time') {
          // Add a helpful message about time format
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'You can specify a time like "tomorrow at 3pm" or "next Monday at 2:30pm"'
          }]);
        } else if (data.intent === 'booking_with_time') {
          // Add booking confirmation UI if needed
          // This could show a confirmation button or additional details
        }
      } else {
        console.error('Chat error:', data.error);
      }
    } catch (error) {
      console.error('Failed to get recommendation:', error);
    } finally {
      setChatLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!pendingAppointment || !contactInfo.name || !contactInfo.email) {
      return;
    }

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: pendingAppointment.id,
          customerName: contactInfo.name,
          customerEmail: contactInfo.email,
          customerPhone: contactInfo.phone
        })
      });

      if (response.ok) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Perfect! Your appointment has been confirmed. You\'ll receive a confirmation email shortly.'
        }]);
        setPendingAppointment(null);
      }
    } catch (error) {
      console.error('Failed to confirm appointment:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">AI Barber Assistant</h2>
            
            {/* Chat Messages */}
            <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <p className="text-gray-500">Thinking...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleAISearch} className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask about specific haircuts, styles, or availability..."
                className="flex-1 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      {pendingAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Your Appointment</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                value={contactInfo.name}
                onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 border rounded"
              />
              <input
                type="email"
                placeholder="Your Email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-2 border rounded"
              />
              <input
                type="tel"
                placeholder="Your Phone (optional)"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full p-2 border rounded"
              />
              <button
                onClick={handleConfirmBooking}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 