'use client';

import { useState } from 'react';

export default function UnavailableTimes() {
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [dateInput, setDateInput] = useState('');
  const [timeInput, setTimeInput] = useState('');

  const handleAddUnavailableTime = () => {
    if (dateInput && timeInput) {
      const newUnavailableTime = `${dateInput} ${timeInput}`;
      setUnavailableDates([...unavailableDates, newUnavailableTime]);
      setDateInput('');
      setTimeInput('');
    }
  };

  const handleSubmit = async () => {
    // Send the unavailable times to the API
    await fetch('/api/barber/unavailable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unavailableTimes: unavailableDates }),
    });
    alert('Unavailable times updated successfully!');
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Set Unavailable Times</h2>
      <div className="flex space-x-2">
        <input
          type="date"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          className="border rounded p-2"
        />
        <input
          type="time"
          value={timeInput}
          onChange={(e) => setTimeInput(e.target.value)}
          className="border rounded p-2"
        />
        <button
          onClick={handleAddUnavailableTime}
          className="bg-blue-600 text-white rounded p-2"
        >
          Add Unavailable Time
        </button>
      </div>
      <textarea
        placeholder="Enter unavailable times (e.g., 'Monday 2 PM - 4 PM')"
        className="border rounded p-2 w-full"
        onChange={(e) => setUnavailableDates(e.target.value.split(','))}
      ></textarea>
      <ul className="mt-4">
        {unavailableDates.map((time, index) => (
          <li key={index} className="text-gray-700">
            {time}
          </li>
        ))}
      </ul>
      <button
        onClick={handleSubmit}
        className="mt-4 bg-green-600 text-white rounded p-2"
      >
        Save Unavailable Times
      </button>
    </div>
  );
} 