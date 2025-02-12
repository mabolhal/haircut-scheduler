'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

export interface SchedulingData {
  name: string;
  email: string;
  phone: string;
  serviceType: string;
}

interface SchedulingFormProps {
  onSubmit: (data: SchedulingData) => void;
  submitButtonText?: string;
  selectedSlot: { start: Date; end: Date } | null;
  barberId: number;
}

export default function SchedulingForm({ 
  onSubmit, 
  submitButtonText = "Schedule Appointment",
  selectedSlot,
  barberId 
}: SchedulingFormProps) {
  const [formData, setFormData] = useState<SchedulingData>({
    name: '',
    email: '',
    phone: '',
    serviceType: ''
  });

  const [phoneError, setPhoneError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');

  const router = useRouter();

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phone) {
      setPhoneError('Phone number is required');
      return false;
    }
    if (!phoneRegex.test(phone)) {
      setPhoneError('Please enter a valid phone number');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isPhoneValid = validatePhone(formData.phone);
    const isEmailValid = validateEmail(formData.email);
    if (isPhoneValid && isEmailValid) {
      if (!barberId || isNaN(barberId)) {
        console.error('Invalid barber ID:', barberId);
        alert('Invalid barber ID');
        return;
      }

      const payload = {
        startTime: selectedSlot?.start,
        endTime: selectedSlot?.end,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        serviceType: formData.serviceType,
        barberId: Number(barberId),
      };
      console.log('Sending appointment request:', payload);

      fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          console.error('Appointment error:', data.error);
          alert(data.error);
        } else {
          localStorage.setItem('scheduledAppointment', JSON.stringify(data));
          router.push('/summary');
        }
      })
      .catch(error => {
        console.error('Error scheduling appointment:', error);
        alert('Failed to schedule appointment. Please try again.');
      });
    }
  };

  const formattedDate = selectedSlot 
    ? format(selectedSlot.start, 'EEEE, MMMM d, yyyy')
    : '';
  const formattedTime = selectedSlot
    ? `${format(selectedSlot.start, 'h:mm a')} - ${format(selectedSlot.end, 'h:mm a')}`
    : '';

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Schedule a Haircut</h2>
      
      {selectedSlot ? (
        <div className="mb-6 p-4 bg-blue-50 rounded-md">
          <p className="font-medium text-blue-900">{formattedDate}</p>
          <p className="text-blue-700">{formattedTime}</p>
        </div>
      ) : (
        <p className="mb-6 text-gray-500">Please select a time slot from the calendar</p>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            required
            placeholder="your@email.com"
            className={`mt-1 block w-full rounded-md shadow-sm ${
              emailError ? 'border-red-300' : 'border-gray-300'
            }`}
            value={formData.email}
            onChange={(e) => {
              setFormData({...formData, email: e.target.value});
              if (emailError) validateEmail(e.target.value);
            }}
          />
          {emailError && (
            <p className="mt-1 text-sm text-red-600">{emailError}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="tel"
            required
            placeholder="+1234567890"
            className={`mt-1 block w-full rounded-md shadow-sm ${
              phoneError ? 'border-red-300' : 'border-gray-300'
            }`}
            value={formData.phone}
            onChange={(e) => {
              setFormData({...formData, phone: e.target.value});
              if (phoneError) validatePhone(e.target.value);
            }}
          />
          {phoneError && (
            <p className="mt-1 text-sm text-red-600">{phoneError}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Service Type
          </label>
          <select
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            value={formData.serviceType}
            onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
          >
            <option value="">Select a service</option>
            <option value="haircut">Haircut (€30)</option>
            <option value="beard">Beard Trim (€20)</option>
            <option value="both">Haircut & Beard Trim (€45)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={!selectedSlot}
          className={`w-full py-2 px-4 rounded-md ${
            selectedSlot
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {!selectedSlot ? 'Select a time slot first' : submitButtonText}
        </button>
      </div>
    </form>
  );
} 