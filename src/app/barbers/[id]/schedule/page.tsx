'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMinutes } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import SchedulingForm from '../../../../../components/SchedulingForm';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    'en-US': enUS,
  },
});

export default function SchedulePage() {
  const params = useParams();
  const barberId = parseInt(params.id as string);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  console.log('Scheduling page barberId:', barberId);

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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Schedule an Appointment</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Calendar Section */}
          <div className="lg:w-2/3 bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Select a Time Slot</h2>
            <Calendar
              localizer={localizer}
              defaultView="week"
              views={['week']}
              selectable
              min={new Date(new Date().setHours(9, 0, 0))} // 9 AM
              max={new Date(new Date().setHours(17, 0, 0))} // 5 PM
              step={30}
              timeslots={1}
              onSelectSlot={handleSelectSlot}
              style={{ height: 600 }}
            />
          </div>

          {/* Scheduling Form Section */}
          <div className="lg:w-1/3 bg-white p-4 rounded-lg shadow">
            <SchedulingForm 
              onSubmit={() => {}}
              selectedSlot={selectedSlot}
              barberId={barberId}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 