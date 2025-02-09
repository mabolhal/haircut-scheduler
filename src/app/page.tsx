'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 md:py-28">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Professional Haircuts</span>
              <span className="block text-blue-600">When You Need Them</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Book your next haircut with our experienced barbers. Quick, easy, and convenient scheduling.
            </p>
            <div className="mt-10 flex justify-center gap-x-6">
              <button
                onClick={() => router.push('/barbers')}
                className="rounded-md bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Find a Barber
              </button>
              <button
                onClick={() => router.push('/about')}
                className="rounded-md bg-white px-8 py-3 text-lg font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-32">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="flex justify-center">
                  <div className="rounded-lg bg-blue-100 p-3">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-semibold">Quick Booking</h3>
                <p className="mt-2 text-gray-500">Book your appointment in less than 2 minutes</p>
              </div>

              <div className="text-center">
                <div className="flex justify-center">
                  <div className="rounded-lg bg-blue-100 p-3">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-semibold">Expert Barbers</h3>
                <p className="mt-2 text-gray-500">Experienced professionals at your service</p>
              </div>

              <div className="text-center">
                <div className="flex justify-center">
                  <div className="rounded-lg bg-blue-100 p-3">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-semibold">Instant Confirmation</h3>
                <p className="mt-2 text-gray-500">Get immediate booking confirmation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
