'use client';

import { useState } from 'react';

interface AnalyticsData {
  dailyEarnings: number;
  monthlyEarnings: number;
  totalAppointments: number;
}

export default function AnalyticsDashboard() {
  const [analytics] = useState<AnalyticsData>({
    dailyEarnings: 150,
    monthlyEarnings: 3250,
    totalAppointments: 45
  });

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Analytics Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Today</h3>
          <p className="text-2xl font-bold">€{analytics.dailyEarnings}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Monthly Earnings</h3>
          <p className="text-2xl font-bold">€{analytics.monthlyEarnings}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Total Appointments</h3>
          <p className="text-2xl font-bold">{analytics.totalAppointments}</p>
        </div>
      </div>
    </div>
  );
} 