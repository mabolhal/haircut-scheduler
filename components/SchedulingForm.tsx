'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

export interface SchedulingData {
  name: string;
  email: string;
  phone: string;
  serviceIds: number[];
}

interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
}

interface SchedulingFormProps {
  onSubmit?: (data: SchedulingData) => void;
  submitButtonText?: string;
  selectedSlot: { start: Date; end: Date } | null;
  barberId: number;
  isSubmitting?: boolean;
}

export default function SchedulingForm({ 
  onSubmit = () => {},
  submitButtonText = "Schedule Appointment",
  selectedSlot,
  barberId,
  isSubmitting = false
}: SchedulingFormProps) {
  const [formData, setFormData] = useState<SchedulingData>({
    name: '',
    email: '',
    phone: '',
    serviceIds: []
  });
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [phoneError, setPhoneError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [serviceError, setServiceError] = useState<string>('');

  const router = useRouter();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`/api/barber/${barberId}/services`);
        const data = await response.json();
        if (response.ok) {
          setServices(data.services);
        } else {
          console.error('Failed to fetch services:', data.error);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setIsLoadingServices(false);
      }
    };

    if (barberId) {
      fetchServices();
    }
  }, [barberId]);

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

  const handleServiceChange = (serviceId: number) => {
    setFormData(prev => {
      const newServiceIds = prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId];
      
      setServiceError(newServiceIds.length === 0 ? 'Please select at least one service' : '');
      return { ...prev, serviceIds: newServiceIds };
    });
  };

  const calculateTotalDuration = () => {
    return services
      .filter(service => formData.serviceIds.includes(service.id))
      .reduce((total, service) => total + service.duration, 0);
  };

  const calculateTotalPrice = () => {
    return services
      .filter(service => formData.serviceIds.includes(service.id))
      .reduce((total, service) => total + service.price, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isPhoneValid = validatePhone(formData.phone);
    const isEmailValid = validateEmail(formData.email);
    
    if (formData.serviceIds.length === 0) {
      setServiceError('Please select at least one service');
      return;
    }

    if (isPhoneValid && isEmailValid) {
      if (!barberId || isNaN(barberId)) {
        console.error('Invalid barber ID:', barberId);
        alert('Invalid barber ID');
        return;
      }

      const selectedServices = services.filter(service => formData.serviceIds.includes(service.id));
      const totalDuration = calculateTotalDuration();
      
      // Adjust end time based on total service duration
      const endTime = new Date(selectedSlot!.start);
      endTime.setMinutes(endTime.getMinutes() + totalDuration);

      const payload = {
        startTime: selectedSlot?.start,
        endTime: endTime,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        serviceIds: formData.serviceIds,
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
          localStorage.setItem('scheduledAppointment', JSON.stringify({
            ...data,
            services: selectedServices,
            totalPrice: calculateTotalPrice()
          }));
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Services
          </label>
          {isLoadingServices ? (
            <div className="text-gray-500">Loading services...</div>
          ) : services.length === 0 ? (
            <div className="text-gray-500">No services available</div>
          ) : (
            <div className="space-y-2">
              {services.map(service => (
                <label key={service.id} className="flex items-start space-x-3 p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.serviceIds.includes(service.id)}
                    onChange={() => handleServiceChange(service.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{service.name}</div>
                    <div className="text-sm text-gray-500">{service.description}</div>
                    <div className="text-sm text-gray-600">
                      Duration: {service.duration} minutes • Price: €{service.price.toFixed(2)}
                    </div>
                  </div>
                </label>
              ))}
              {serviceError && (
                <p className="text-sm text-red-600">{serviceError}</p>
              )}
            </div>
          )}
        </div>

        {formData.serviceIds.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="font-medium">Summary</div>
            <div className="text-sm text-gray-600">
              Total Duration: {calculateTotalDuration()} minutes
            </div>
            <div className="text-sm text-gray-600">
              Total Price: €{calculateTotalPrice().toFixed(2)}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedSlot || isSubmitting || formData.serviceIds.length === 0}
          className={`w-full py-2 px-4 rounded-md ${
            selectedSlot && !isSubmitting && formData.serviceIds.length > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {!selectedSlot 
            ? 'Select a time slot first' 
            : isSubmitting 
              ? 'Scheduling...' 
              : submitButtonText}
        </button>
      </div>
    </form>
  );
} 