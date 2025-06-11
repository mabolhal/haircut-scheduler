'use client';

import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, Event, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  serviceType: string;
  status: string;
  barberId: number;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
}

interface BarberAvailability {
  [day: string]: { start: string; end: string } | null;
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

const generateTimeSlots = (availability: BarberAvailability, date: Date): Date[] => {
  const dayOfWeek = format(date, 'EEEE').toLowerCase();
  const dayAvailability = availability[dayOfWeek];
  
  if (!dayAvailability) return [];

  const slots: Date[] = [];
  const [startHour, startMinute] = dayAvailability.start.split(':').map(Number);
  const [endHour, endMinute] = dayAvailability.end.split(':').map(Number);
  
  const startTime = new Date(date);
  startTime.setHours(startHour, startMinute, 0, 0);
  
  const endTime = new Date(date);
  endTime.setHours(endHour, endMinute, 0, 0);
  
  let currentSlot = new Date(startTime);
  
  while (currentSlot < endTime) {
    slots.push(new Date(currentSlot));
    currentSlot.setMinutes(currentSlot.getMinutes() + 30);
  }
  
  return slots;
};

export default function BarberCalendar() {
  const [appointments, setAppointments] = useState<CalendarEvent[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [barberAvailability, setBarberAvailability] = useState<BarberAvailability | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!isMounted) return;
      
      setError(null);
      setIsLoading(true);
      const barberId = localStorage.getItem('barberId');
      
      if (!barberId || barberId === 'undefined') {
        setError('Invalid barber ID');
        setIsLoading(false);
        return;
      }

      try {
        const [appointmentsResponse, barberResponse] = await Promise.all([
          fetch(`/api/appointments?barberId=${barberId}`, {
            headers: {
              'Cache-Control': 'no-cache'
            }
          }),
          fetch(`/api/barber?id=${barberId}`, {
            headers: {
              'Cache-Control': 'no-cache'
            }
          })
        ]);

        if (!isMounted) return;

        const appointmentsData = await appointmentsResponse.json();
        const barberData = await barberResponse.json();
        
        if (appointmentsData.success) {
          const formattedAppointments = appointmentsData.appointments.map((appointment: Appointment) => ({
            id: appointment.id,
            title: appointment.serviceType,
            start: new Date(appointment.startTime),
            end: new Date(appointment.endTime),
            customer: appointment.customer.name,
            service: appointment.serviceType,
            customerEmail: appointment.customer.email,
            customerPhone: appointment.customer.phone,
            barberId: appointment.barberId,
          }));
          setAppointments(formattedAppointments);
        }

        if (barberData.barber) {
          setBarberAvailability(barberData.barber.availability);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array since we only want to fetch on mount

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    if (!barberAvailability) return;

    const slots = generateTimeSlots(barberAvailability, start);
    const slotExists = slots.some(slot => 
      slot.getTime() === start.getTime()
    );

    if (!slotExists) {
      alert('This time slot is not within barber\'s working hours');
      return;
    }

    // Check if the slot is already booked
    const isBooked = appointments.some(apt => 
      (start >= apt.start && start < apt.end) ||
      (end > apt.start && end <= apt.end)
    );

    if (isBooked) {
      alert('This time slot is already booked');
      return;
    }

    setSelectedAppointment({
      id: 'new',
      title: 'New Appointment',
      start,
      end,
      customer: '',
      service: '',
      barberId: parseInt(localStorage.getItem('barberId') || '0')
    });
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedAppointment(event);
  };

  const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    const currentDate = new Date(date);
    switch (action) {
      case 'PREV':
        if (view === 'month') {
          currentDate.setMonth(currentDate.getMonth() - 1);
        } else if (view === 'week') {
          currentDate.setDate(currentDate.getDate() - 7);
        } else {
          currentDate.setDate(currentDate.getDate() - 1);
        }
        break;
      case 'NEXT':
        if (view === 'month') {
          currentDate.setMonth(currentDate.getMonth() + 1);
        } else if (view === 'week') {
          currentDate.setDate(currentDate.getDate() + 7);
        } else {
          currentDate.setDate(currentDate.getDate() + 1);
        }
        break;
      case 'TODAY':
        currentDate.setTime(new Date().getTime());
        break;
    }
    setDate(currentDate);
  };

  if (isLoading) {
    return (
      <div className="h-screen p-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-gray-600 text-center py-4">
            Loading calendar...
          </div>
        </div>
      </div>
    );
  }

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
          onSelectSlot={handleSelectSlot}
          selectable
          step={30}
          timeslots={1}
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
          date={date}
          onNavigate={(newDate) => setDate(newDate)}
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