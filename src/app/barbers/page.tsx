'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Barber {
  id: number;
  name: string;
  imageUrl?: string;
  rating: number;
  specialties: string[];
  experience: number;
}

export default function BarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBarbers() {
      try {
        const response = await fetch('/api/barbers');
        if (response.ok) {
          const data = await response.json();
          if (data.barbers) {
            setBarbers(data.barbers);
          }
        }
      } catch (error) {
        console.error('Failed to fetch barbers:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBarbers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Our Barbers</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {barbers.map((barber) => (
            <div key={barber.id} className="bg-white rounded-lg shadow p-6">
              {barber.imageUrl && (
                <Image
                  src={barber.imageUrl}
                  alt={barber.name}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <h2 className="text-xl font-bold mb-2">{barber.name}</h2>
              <p className="text-gray-600 mb-2">{barber.experience} years experience</p>
              <div className="mb-4">
                {barber.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-2 mb-2"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
              <Link
                href={`/barbers/${barber.id}/schedule`}
                className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Schedule with {barber.name}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 