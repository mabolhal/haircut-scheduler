'use client';

import { useState } from 'react';
import BarberCalendar from '../../../components/BarberCalendar';
import AnalyticsDashboard from '../../../components/AnalyticsDashboard';

export default function Dashboard() {
  const [view, setView] = useState<'calendar' | 'analytics'>('calendar');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Barber Dashboard
            </h1>
            <div className="space-x-4">
              <button
                onClick={() => setView('calendar')}
                className={`px-4 py-2 rounded-md ${
                  view === 'calendar' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Calendar
              </button>
              <button
                onClick={() => setView('analytics')}
                className={`px-4 py-2 rounded-md ${
                  view === 'analytics' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Analytics
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {view === 'calendar' ? <BarberCalendar /> : <AnalyticsDashboard />}
      </main>
    </div>
  );
} 