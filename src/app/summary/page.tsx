'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
}

interface AppointmentSummary {
  appointment: {
    id: number;
    startTime: string;
    endTime: string;
    status: string;
    customer: {
      name: string;
      email: string;
      phone: string;
    };
    services: Service[];
  };
  totalPrice: number;
}

export default function SummaryPage() {
  const [appointment, setAppointment] = useState<AppointmentSummary | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedAppointment = localStorage.getItem('scheduledAppointment');
    if (!savedAppointment) {
      router.push('/');
      return;
    }
    setAppointment(JSON.parse(savedAppointment));
  }, [router]);

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
          <p className="text-center text-gray-500">Loading appointment details...</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'EEEE, MMMM d, yyyy h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
        <h2 className="text-3xl font-bold mb-6">Appointment Summary</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Customer</p>
            <p className="font-medium">{appointment.appointment.customer.name}</p>
            <p className="text-sm text-gray-600">{appointment.appointment.customer.email}</p>
            <p className="text-sm text-gray-600">{appointment.appointment.customer.phone}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Services</p>
            <div className="mt-2 space-y-2">
              {appointment.appointment.services.map((service) => (
                <div key={service.id} className="p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-gray-600">{service.description}</p>
                  <p className="text-sm text-gray-600">
                    Duration: {service.duration} minutes • Price: €{service.price.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Total Price</p>
            <p className="font-medium">€{appointment.totalPrice.toFixed(2)}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Start Time</p>
            <p className="font-medium">{formatDate(appointment.appointment.startTime)}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">End Time</p>
            <p className="font-medium">{formatDate(appointment.appointment.endTime)}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium capitalize">{appointment.appointment.status}</p>
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