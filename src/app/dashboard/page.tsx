'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BarberCalendar from '../../../components/BarberCalendar';
import BarberAvailability from '../../../components/BarberAvailability';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const barberId = localStorage.getItem('barberId');
      const barberName = localStorage.getItem('barberName');
      
      if (!barberId || barberId === 'undefined' || !barberName) {
        localStorage.removeItem('barberId');
        localStorage.removeItem('barberName');
        router.push('/auth/login');
        return;
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <BarberCalendar />
          {/* <BarberAvailability /> */}
        </div>
      </main>
    </div>
  );
} 