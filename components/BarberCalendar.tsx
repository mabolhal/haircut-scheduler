'use client';

import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, Event, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceType: string;
  status: string;
  barberId: number;
}

interface CalendarEvent extends Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  customer: string;
  service: string;
  customerEmail?: string;
  customerPhone?: string;
  barberId: number;
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    'en-US': enUS,
  },
});

export default function BarberCalendar() {
  const [appointments, setAppointments] = useState<CalendarEvent[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('month');

  useEffect(() => {
    const fetchAppointments = async () => {
      setError(null);
      const barberId = localStorage.getItem('barberId');
      
      if (!barberId || barberId === 'undefined') {
        setError('Invalid barber ID');
        return;
      }

      try {
        const response = await fetch(`/api/appointments?barberId=${barberId}`);
        const data = await response.json();
        
        if (data.success) {
          const formattedAppointments = data.appointments.map((appointment: Appointment) => ({
            id: appointment.id,
            title: appointment.serviceType,
            start: new Date(appointment.startTime),
            end: new Date(appointment.endTime),
            customer: appointment.customerName,
            service: appointment.serviceType,
            customerEmail: appointment.customerEmail,
            customerPhone: appointment.customerPhone,
            barberId: appointment.barberId,
          }));
          setAppointments(formattedAppointments);
        } else {
          setError(data.error || 'Failed to fetch appointments');
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setError('Failed to fetch appointments');
      }
    };

    fetchAppointments();
  }, []);

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedAppointment(event);
  };

  const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    const calendar = document.querySelector('.rbc-calendar') as any;
    if (calendar) {
      switch (action) {
        case 'PREV':
          calendar.getApi().prev();
          break;
        case 'NEXT':
          calendar.getApi().next();
          break;
        case 'TODAY':
          calendar.getApi().today();
          break;
      }
    }
  };

  if (error) {
    return (
      <div className="h-screen p-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-red-600 text-center py-4">
            {error}. Please try logging in again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen p-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Appointments Calendar</h2>
        <Calendar
          localizer={localizer}
          events={appointments}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          onSelectEvent={handleSelectEvent}
          tooltipAccessor={(event) => `${event.customer} - ${event.title}`}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: '#3174ad',
              color: 'white',
              borderRadius: '5px',
              padding: '10px',
            },
          })}
          view={view}
          onView={(newView) => setView(newView)}
        />
        {selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Appointment Details</h2>
                <button 
                  onClick={() => setSelectedAppointment(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                <p><span className="font-semibold">Customer:</span> {selectedAppointment.customer}</p>
                <p><span className="font-semibold">Service:</span> {selectedAppointment.service}</p>
                <p><span className="font-semibold">Date:</span> {format(selectedAppointment.start, 'MMMM d, yyyy')}</p>
                <p><span className="font-semibold">Time:</span> {format(selectedAppointment.start, 'h:mm a')} - {format(selectedAppointment.end, 'h:mm a')}</p>
                {selectedAppointment.customerEmail && (
                  <p><span className="font-semibold">Email:</span> {selectedAppointment.customerEmail}</p>
                )}
                {selectedAppointment.customerPhone && (
                  <p><span className="font-semibold">Phone:</span> {selectedAppointment.customerPhone}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 