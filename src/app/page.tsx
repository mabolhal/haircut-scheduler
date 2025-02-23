'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="bg-white">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Book Your Next Haircut with Ease
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Connect with top barbers in your area and schedule appointments hassle-free.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-4">
              <button
                onClick={() => router.push('/ai-search')}
                className="rounded-md bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                Use AI Assistant
              </button>
              <button
                onClick={() => router.push('/barbers')}
                className="rounded-md bg-gray-600 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-gray-500"
              >
                View All Barbers
              </button>
            </div>
            <div className="mt-4">
              <button
                onClick={() => router.push('/about')}
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                Learn more <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
