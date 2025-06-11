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
  city?: string;
  provinceState?: string;
}

export default function BarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [filteredBarbers, setFilteredBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  useEffect(() => {
    async function fetchBarbers() {
      try {
        const response = await fetch('/api/barbers');
        if (response.ok) {
          const data = await response.json();
          if (data.barbers) {
            setBarbers(data.barbers);
            setFilteredBarbers(data.barbers);
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

  const handleSearch = () => {
    let filtered = barbers;

    // Filter by name or specialties
    if (searchQuery.trim()) {
      filtered = filtered.filter(barber => 
        barber.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        barber.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Filter by location (city or province/state)
    if (locationQuery.trim()) {
      filtered = filtered.filter(barber => 
        (barber.city && barber.city.toLowerCase().includes(locationQuery.toLowerCase())) ||
        (barber.provinceState && barber.provinceState.toLowerCase().includes(locationQuery.toLowerCase()))
      );
    }

    setFilteredBarbers(filtered);
  };

  // Trigger search when queries change
  useEffect(() => {
    handleSearch();
  }, [searchQuery, locationQuery, barbers]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Our Barbers</h1>
        
        {/* Search Interface */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name or specialty"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by location"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-lg font-medium transition-colors min-w-[100px]"
            >
              Search
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBarbers.map((barber) => (
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
              
              {/* Location Display */}
              {(barber.city || barber.provinceState) && (
                <p className="text-gray-500 mb-2 text-sm flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {[barber.city, barber.provinceState].filter(Boolean).join(', ')}
                </p>
              )}
              
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

        {/* No results message */}
        {filteredBarbers.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No barbers found matching your search criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setLocationQuery('');
              }}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 