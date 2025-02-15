'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AppointmentSummary {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceType: string;
  startTime: string;
  endTime: string;
  status: string;
  barberId: number;
}

export default function SummaryPage() {
  const router = useRouter();
  const [appointment, setAppointment] = useState<AppointmentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedAppointment = localStorage.getItem('scheduledAppointment');
        console.log('Stored appointment:', storedAppointment); // Debug log
        
        if (storedAppointment) {
          const parsedAppointment = JSON.parse(storedAppointment);
  
          console.log('Parsed appointment:', parsedAppointment); // Debug log
          setAppointment(parsedAppointment.appointment);
        }
      } catch (error) {
        console.error('Error retrieving appointment:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !appointment) {
      router.push('/');
    }
  }, [isLoading, appointment, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg">Loading appointment details...</p>
      </div>
    );
  }

  if (!appointment) {
    return null;
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  console.log('Appointment state in render:', appointment); // Debug log
  (window as any).appointment = appointment; // Expose to global scope for debugging

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
        <h2 className="text-3xl font-bold mb-6">Appointment Summary</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Customer</p>
            <p className="font-medium">{appointment.customerName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Service</p>
            <p className="font-medium">{appointment?.serviceType || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Start Time</p>
            <p className="font-medium">{formatDate(appointment?.startTime) || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">End Time</p>
            <p className="font-medium">{formatDate(appointment?.endTime) || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium">{appointment?.status || 'N/A'}</p>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('scheduledAppointment'); // Clean up
            router.push('/');
          }}
          className="mt-8 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}