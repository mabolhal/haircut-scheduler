'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Barber {
  id: number;
  name: string;
  email: string;
  phone: string;
  experience: number;
  specialties: string[];
  bio: string;
  imageUrl: string | null;
  rating: number;
}

export default function BarberProfile() {
  const [barber, setBarber] = useState<Barber | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBarberDetails() {
      try {
        const response = await fetch('/api/barber');
        if (!response.ok) throw new Error('Failed to fetch barber details');
        const data = await response.json();
        setBarber(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchBarberDetails();
  }, []);

  if (loading) return <div className="animate-pulse">Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!barber) return <div>No barber information available</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start space-x-6">
        {barber.imageUrl && (
          <div className="flex-shrink-0">
            <Image
              src={barber.imageUrl}
              alt={barber.name}
              width={120}
              height={120}
              className="rounded-full"
            />
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{barber.name}</h2>
          <div className="mt-2 flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`h-5 w-5 ${
                  i < Math.floor(barber.rating)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-2 text-gray-600">({barber.rating.toFixed(1)})</span>
          </div>
          <p className="mt-3 text-gray-600">{barber.bio}</p>
          <div className="mt-4">
            <h3 className="font-semibold text-gray-900">Specialties</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {barber.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>{barber.experience} years of experience</p>
          </div>
        </div>
      </div>
    </div>
  );
} 