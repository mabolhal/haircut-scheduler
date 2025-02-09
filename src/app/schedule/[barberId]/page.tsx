'use client';

import { use } from 'react';
import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { 
  format, 
  parse, 
  startOfWeek, 
  getDay, 
  isWithinInterval, 
  setHours, 
  setMinutes 
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/styles/calendar.css';
import SchedulingForm from '../../../../components/SchedulingForm';
import BarberProfile from '../../../../components/BarberProfile';
import type { SchedulingData } from '../../../../components/SchedulingForm';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    'en-US': enUS,
  },
});

interface TimeSlot {
  start: Date;
  end: Date;
}

interface Availability {
  [key: string]: { start: string; end: string } | null;
}

export default function SchedulePage({ params }: { params: Promise<{ barberId: string }> }) {
  const resolvedParams = use(params);
  const barberId = parseInt(resolvedParams.barberId);
  
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [barberAvailability, setBarberAvailability] = useState<Availability | null>(null);
  const [barber, setBarber] = useState<any | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchData = async () => {
    try {
      const appointmentsResponse = await fetch(`/api/appointments?barberId=${barberId}`);
      if (appointmentsResponse.ok) {
        const data = await appointmentsResponse.json();
        setEvents(data.appointments.map((apt: any) => ({
          title: 'Booked',
          start: new Date(apt.startTime),
          end: new Date(apt.endTime),
        })));
      }

      const barberResponse = await fetch(`/api/barber?id=${barberId}`);
      if (barberResponse.ok) {
        const data = await barberResponse.json();
        setBarberAvailability(data.barber.availability);
        setBarber(data.barber);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [barberId]);

  const isSlotAvailable = (start: Date) => {
    if (!barberAvailability) return false;

    const dayOfWeek = format(start, 'EEEE').toLowerCase();
    const dayAvailability = barberAvailability[dayOfWeek];

    if (!dayAvailability) return false;

    const timeStr = format(start, 'HH:mm');
    return timeStr >= dayAvailability.start && timeStr < dayAvailability.end;
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    // Ensure 30-minute duration
    const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
    if (duration !== 30) {
      alert('Please select a 30-minute time slot');
      return;
    }

    // Round to nearest 30 minutes
    startDate.setMinutes(Math.floor(startDate.getMinutes() / 30) * 30);
    endDate.setMinutes(startDate.getMinutes() + 30);
    
    // Other checks...
    if (startDate < new Date()) {
      alert('Please select a future time slot');
      return;
    }

    if (!isSlotAvailable(startDate)) {
      alert('This time slot is not within barber\'s working hours');
      return;
    }

    // Check overlap
    const isOverlapping = events.some(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return (
        (startDate >= eventStart && startDate < eventEnd) ||
        (endDate > eventStart && endDate <= eventEnd)
      );
    });

    if (isOverlapping) {
      alert('This time slot is already booked');
      return;
    }

    setSelectedSlot({ 
      start: startDate,
      end: endDate
    });
  };

  const resetScheduler = () => {
    setSelectedSlot(null);
    setBookingStatus('idle');
    fetchData();
  };

  const handleSchedulingSubmit = async (formData: SchedulingData) => {
    if (!selectedSlot) return;

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          startTime: selectedSlot.start,
          endTime: selectedSlot.end,
          barberId,
        }),
      });

      if (response.ok) {
        setBookingStatus('success');
        setTimeout(resetScheduler, 3000);
      } else {
        setBookingStatus('error');
      }
    } catch (error) {
      console.error('Failed to schedule appointment:', error);
      setBookingStatus('error');
    }
  };

  const CustomToolbar = (toolbar: any) => {
    const goToToday = () => {
      toolbar.onNavigate('TODAY');
      setCurrentDate(new Date());
    };

    const goToPrev = () => {
      toolbar.onNavigate('PREV');
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    };

    return (
      <div className="rbc-toolbar">
        <span className="rbc-btn-group">
          <button type="button" onClick={goToToday}>Today</button>
          <button type="button" onClick={goToPrev}>Back</button>
          <button type="button" onClick={goToNext}>Next</button>
        </span>
        <span className="rbc-toolbar-label">
          {format(currentDate, 'MMMM yyyy')}
        </span>
        <span className="rbc-btn-group">
          {toolbar.views.map((view: string) => (
            <button
              key={view}
              type="button"
              onClick={() => toolbar.onView(view)}
              className={view === toolbar.view ? 'rbc-active' : ''}
            >
              {view === 'week' ? 'Week' : 'Day'}
            </button>
          ))}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Schedule Appointment
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white p-4 rounded-lg shadow">
              <Calendar
                localizer={localizer}
                events={[
                  ...events,
                  ...(selectedSlot ? [{
                    title: 'Selected',
                    start: selectedSlot.start,
                    end: selectedSlot.end,
                  }] : [])
                ]}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                selectable="ignoreEvents"
                onSelectSlot={handleSelectSlot}
                onSelecting={({ start, end }) => {
                  const duration = (end.getTime() - start.getTime()) / (1000 * 60);
                  return duration === 30;
                }}
                defaultView="week"
                views={['week', 'day']}
                min={setMinutes(setHours(new Date(), 8), 0)} // Ensure the starting time is exactly 8:00 AM
                max={setMinutes(setHours(new Date(), 20), 0)} // Ensure the ending time is exactly 8:00 PM
                step={30}
                timeslots={2}
                date={currentDate}
                onNavigate={date => setCurrentDate(date)}
                components={{
                  toolbar: CustomToolbar,
                  timeSlotWrapper: ({ children }: { children?: React.ReactNode }) => (
                    <div className="rbc-time-slot-standardized">
                      {children}
                    </div>
                  )
                }}
                formats={{
                  timeGutterFormat: (date: Date) => {
                    const hours = date.getHours();
                    const minutes = date.getMinutes();
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    const displayHours = hours % 12 || 12;
                    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
                  }
                }}
                className="custom-calendar"
                tooltipAccessor={event => 'Booked'}
                dayPropGetter={date => ({
                  className: isSlotAvailable(setHours(date, 12)) ? '' : 'rbc-off-day'
                })}
                slotPropGetter={date => ({
                  className: isSlotAvailable(date) ? '' : 'rbc-disabled'
                })}
                eventPropGetter={(event) => ({
                  className: event.title === 'Selected' ? 'selected-slot' : ''
                })}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow">
              {barber && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    {barber.imageUrl && (
                      <img
                        src={barber.imageUrl}
                        alt={barber.name}
                        className="h-16 w-16 rounded-full"
                      />
                    )}
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{barber.name}</h2>
                      <p className="text-sm text-gray-500">{barber.experience} years experience</p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Haircut</span>
                      <span className="font-medium">${barber.priceHaircut}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-500">Beard Trim</span>
                      <span className="font-medium">${barber.priceBeard}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-500">Haircut & Beard</span>
                      <span className="font-medium">${barber.priceBoth}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              {bookingStatus === 'success' ? (
                <div className="bg-green-50 p-4 rounded-md">
                  <p className="text-green-700">
                    Appointment scheduled successfully! We'll send you a confirmation email.
                  </p>
                </div>
              ) : (
                <SchedulingForm 
                  onSubmit={handleSchedulingSubmit}
                  submitButtonText="Schedule Appointment"
                  selectedSlot={selectedSlot}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 