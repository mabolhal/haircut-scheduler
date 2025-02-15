'use client';

import { useEffect, useState } from 'react';

interface Availability {
  [day: string]: { start: string; end: string } | null;
}

export default function BarberAvailability() {
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [newAvailability, setNewAvailability] = useState('');

  useEffect(() => {
    const fetchAvailability = async () => {
      const response = await fetch('/api/barber/availability');
      const data = await response.json();
      if (response.ok) {
        setAvailability(data.availability);
      } else {
        console.error(data.error);
      }
    };

    fetchAvailability();
  }, []);

  const handleUpdateAvailability = async () => {
    await fetch('/api/barber/unavailable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unavailableTimes: newAvailability.split(',') }),
    });
    alert('Availability updated successfully!');
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Availability Settings</h2>
      {availability && (
        <div className="space-y-4">
          {Object.entries(availability).map(([day, hours]) => (
            <div key={day} className="flex items-center justify-between">
              <span className="capitalize">{day}</span>
              <span>{hours ? `${hours.start} - ${hours.end}` : 'Unavailable'}</span>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4">
        <textarea
          className="w-full p-2 border rounded"
          value={newAvailability}
          onChange={(e) => setNewAvailability(e.target.value)}
          placeholder="Enter unavailable times (e.g., Monday 9:00-17:00)"
        />
        <button
          onClick={handleUpdateAvailability}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Update Availability
        </button>
      </div>
    </div>
  );
} 