'use client';

import { useEffect, useState } from 'react';

export default function BarberAvailability() {
  const [availability, setAvailability] = useState<any>(null);
  const [newAvailability, setNewAvailability] = useState('');

  useEffect(() => {
    const fetchAvailability = async () => {
      const response = await fetch('/api/barber/availability'); // Create this API route
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
      
    </div>
  );
} 