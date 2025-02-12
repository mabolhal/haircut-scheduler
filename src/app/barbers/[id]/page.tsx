'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function BarberProfilePage() {
  const params = useParams();
  const barberId = params.id;

  return (
    // ... other barber profile content ...
    <Link
      href={`/barbers/${barberId}/schedule`}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Schedule Appointment
    </Link>
    // ... rest of the component
  );
} 