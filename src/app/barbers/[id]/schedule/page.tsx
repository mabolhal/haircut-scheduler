'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMinutes } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import SchedulingForm from '../../../../../components/SchedulingForm';
import AppointmentScheduler from '@/components/AppointmentScheduler';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    'en-US': enUS,
  },
});

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  barberId: number;
  status: string;
}

export default function SchedulePage() {
  const params = useParams();
  const router = useRouter();
  const barberId = parseInt(params.id as string);
  const [barberName, setBarberName] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch barber name and cache it
  useEffect(() => {
    const fetchBarberName = async () => {
      // Check cache first
      const cachedData = localStorage.getItem('barberData');
      const cacheTime = localStorage.getItem('barberDataTime');
      
      if (cachedData && cacheTime) {
        const parsedData = JSON.parse(cachedData);
        const parsedTime = parseInt(cacheTime);
        const now = Date.now();
        
        // Use cache if it's less than 5 minutes old
        if (now - parsedTime < 5 * 60 * 1000) {
          const barber = parsedData.find((b: any) => b.id === barberId);
          if (barber) {
            setBarberName(barber.name);
            return;
          }
        }
      }
      
      // If no cache or expired, fetch from API
      try {
        const response = await fetch(`/api/barber?id=${barberId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.barber) {
            setBarberName(data.barber.name);
            
            // Update cache with all barbers
            const barbersResponse = await fetch('/api/barbers');
            if (barbersResponse.ok) {
              const barbersData = await barbersResponse.json();
              localStorage.setItem('barberData', JSON.stringify(barbersData.barbers));
              localStorage.setItem('barberDataTime', Date.now().toString());
            }
          }
        }
      } catch (error) {
        console.error('Error fetching barber name:', error);
      }
    };

    if (barberId) {
      fetchBarberName();
    }
  }, [barberId]);

  // Fetch existing appointments for this barber
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`/api/barbers/${barberId}/appointments`);
        const data = await response.json();
        
        if (response.ok) {
          setAppointments(data.appointments);
        } else {
          console.error('Failed to fetch appointments:', data.error);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (barberId) {
      fetchAppointments();
    }
  }, [barberId]);

  if (!barberId || isNaN(barberId)) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
            Invalid barber ID
          </div>
        </div>
      </div>
    );
  }

  const handleSelectSlot = ({ start }: { start: Date }) => {
    // Set end time to 30 minutes after start time
    const end = addMinutes(start, 30);
    setSelectedSlot({ start, end });
  };

  const handleTimeSlotSelect = (slot: { start: Date; end: Date } | null) => {
    setSelectedSlot(slot);
  };

  const handleSubmit = async (formData: any) => {
    if (!selectedSlot) {
      alert('Please select a time slot');
      return;
    }

    setBookingStatus('loading');

    try {
      const appointmentData = {
        startTime: selectedSlot.start.toISOString(),
        endTime: selectedSlot.end.toISOString(),
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        serviceType: formData.serviceType,
        barberId,
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });

      const data = await response.json();

      if (response.ok) {
        setBookingStatus('success');
        // Store appointment data for summary page
        localStorage.setItem('scheduledAppointment', JSON.stringify({
          ...appointmentData,
          id: data.appointment.id,
          status: 'confirmed'
        }));
        
        // Add a small delay before redirect
        setTimeout(() => {
          router.push('/summary');
        }, 500);
      } else {
        setBookingStatus('error');
        alert(data.error || 'Failed to schedule appointment');
      }
    } catch (error) {
      console.error('Failed to schedule appointment:', error);
      setBookingStatus('error');
      alert('Failed to schedule appointment. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Schedule an Appointment with {barberName}</h1>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-gray-600">Loading available times...</div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Appointment Scheduler Section */}
            <div className="lg:w-2/3 bg-white p-4 rounded-lg shadow">
              <AppointmentScheduler 
                barberId={barberId} 
                onTimeSlotSelect={handleTimeSlotSelect}
                existingAppointments={appointments}
              />
            </div>

            {/* Scheduling Form Section */}
            <div className="lg:w-1/3 bg-white p-4 rounded-lg shadow">
              <SchedulingForm 
                onSubmit={handleSubmit}
                selectedSlot={selectedSlot}
                barberId={barberId}
                isSubmitting={bookingStatus === 'loading'}
              />
            </div>
          </div>
        )}

        {/* Status Messages */}
        {bookingStatus === 'loading' && (
          <div className="mt-4 text-blue-600">
            Booking your appointment...
          </div>
        )}
        {bookingStatus === 'error' && (
          <div className="mt-4 text-red-600">
            There was an error booking your appointment. Please try again.
          </div>
        )}
      </div>
    </div>
  );
} 