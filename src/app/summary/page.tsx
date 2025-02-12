'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SummaryPage() {
  const router = useRouter();
  const [appointment, setAppointment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add a small delay to ensure localStorage is available
    const timer = setTimeout(() => {
      const storedAppointment = localStorage.getItem('scheduledAppointment');
      if (storedAppointment) {
        setAppointment(JSON.parse(storedAppointment));
        // Don't remove the appointment data immediately
        // localStorage.removeItem('scheduledAppointment');
      }
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Only redirect if we're not loading and there's no appointment
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
        <h2 className="text-3xl font-bold mb-4">Appointment Summary</h2>
        <p><strong>Customer:</strong> {appointment.customerName}</p>
        <p><strong>Service:</strong> {appointment.serviceType}</p>
        <p><strong>Start Time:</strong> {new Date(appointment.startTime).toLocaleString()}</p>
        <p><strong>End Time:</strong> {new Date(appointment.endTime).toLocaleString()}</p>
        <p><strong>Status:</strong> Confirmed</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 bg-blue-600 text-white rounded p-2"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
} 