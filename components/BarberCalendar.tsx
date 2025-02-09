'use client';

import { useState } from 'react';

interface Appointment {
  id: string;
  title: string;
  start: Date;
  end: Date;
  customer: string;
  service: string;
}

export default function BarberCalendar() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  return (
    <div className="h-screen p-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Appointments Calendar</h2>
        {/* Calendar implementation will go here once we add react-big-calendar */}
        <p className="text-gray-500">Calendar view coming soon...</p>
      </div>
    </div>
  );
} 