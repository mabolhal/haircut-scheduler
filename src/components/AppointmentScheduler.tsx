'use client';

import React, { useState, useEffect } from 'react';
import { format, isAfter, isBefore, startOfDay, endOfDay, parseISO, isSameDay } from 'date-fns';

interface Props {
  barberId: number;
  onTimeSlotSelect: (slot: { start: Date; end: Date } | null) => void;
  existingAppointments: Appointment[];
}

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  barberId: number;
  status: string;
}

interface BarberAvailability {
  [day: string]: { start: string; end: string } | null;
}

const AppointmentScheduler: React.FC<Props> = ({ barberId, onTimeSlotSelect, existingAppointments }) => {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [barberAvailability, setBarberAvailability] = useState<BarberAvailability | null>(null);

  // Function to generate time slots based on availability
  const generateTimeSlots = (availability: BarberAvailability, date: Date): string[] => {
    const dayOfWeek = format(date, 'EEEE').toLowerCase();
    const dayAvailability = availability[dayOfWeek];
    
    if (!dayAvailability) return [];

    const slots: string[] = [];
    const [startHour, startMinute] = dayAvailability.start.split(':').map(Number);
    const [endHour, endMinute] = dayAvailability.end.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMinute = startMinute;
    
    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')} ${currentHour >= 12 ? 'PM' : 'AM'}`;
      slots.push(timeStr);
      
      // Add 30 minutes
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }
    
    return slots;
  };

  useEffect(() => {
    const fetchBarberAvailability = async () => {
      try {
        const response = await fetch(`/api/barber?id=${barberId}`);
        const data = await response.json();
        if (response.ok) {
          setBarberAvailability(data.barber.availability);
        }
      } catch (error) {
        console.error('Failed to fetch barber availability:', error);
      }
    };

    fetchBarberAvailability();
  }, [barberId]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`/api/appointments?barberId=${barberId}`);
        const data = await response.json();
        if (response.ok) {
          setAppointments(data.appointments);
        }
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedDay) {
      fetchAppointments();
    }
  }, [barberId, selectedDay]);

  const isTimeSlotBooked = (time: string): boolean => {
    if (!selectedDay) return false;

    // Convert time string to Date object
    const timeDate = new Date(selectedDay);
    const [hourStr, minuteStr] = time.split(':');
    const isPM = time.includes('PM');
    let hour = parseInt(hourStr);
    
    if (isPM && hour !== 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
    
    timeDate.setHours(hour, parseInt(minuteStr.split(' ')[0]), 0, 0);

    // Check if time has passed
    if (isBefore(timeDate, new Date())) {
      return true;
    }

    // Check if time slot overlaps with any existing appointments
    console.log("existingAppointments", existingAppointments);
    return existingAppointments.some(appointment => {
      const start = new Date(appointment.startTime);
      const end = new Date(appointment.endTime);
      
      return (
        isSameDay(timeDate, start) && 
        timeDate >= start && 
        timeDate < end
      );
    });
  };

  const getDaysInMonth = (year: number, month: number): Date[] => {
    const date = new Date(year, month, 1);
    const days: Date[] = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
    setSelectedDay(null);
    setSelectedTime(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
    setSelectedDay(null);
    setSelectedTime(null);
  };

  const daysInMonth = getDaysInMonth(
    currentMonth.getFullYear(),
    currentMonth.getMonth()
  );

  const handleDayClick = (day: Date) => {
    // Prevent selecting past dates
    if (isBefore(endOfDay(day), startOfDay(new Date()))) {
      return;
    }
    setSelectedDay(day);
    setSelectedTime(null);
  };

  const handleTimeClick = (time: string) => {
    if (isTimeSlotBooked(time)) return;
    
    setSelectedTime(time);
    if (selectedDay) {
      const [hourStr, minuteStr] = time.split(':');
      const isPM = time.includes('PM');
      let hour = parseInt(hourStr);
      
      if (isPM && hour !== 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;
      
      const startTime = new Date(selectedDay);
      startTime.setHours(hour, parseInt(minuteStr.split(' ')[0]), 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 30);
      
      onTimeSlotSelect({ start: startTime, end: endTime });
    }
  };

  const formattedSelectedDay = selectedDay
    ? selectedDay.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "No day selected";

  // Replace the hardcoded availableTimes with dynamic generation
  const availableTimes = selectedDay && barberAvailability 
    ? generateTimeSlots(barberAvailability, selectedDay)
    : [];

  return (
    <div className="font-sans p-5">
      <h1 className="text-2xl font-bold mb-6">Appointment Scheduler</h1>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePreviousMonth}
          disabled={isBefore(startOfDay(currentMonth), startOfDay(new Date()))}
          className={`px-4 py-2 rounded-md ${
            isBefore(startOfDay(currentMonth), startOfDay(new Date()))
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Previous Month
        </button>
        <h2 className="text-xl font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={handleNextMonth}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Next Month
        </button>
      </div>

      {/* Day Picker */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Select a Day</h2>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-medium text-gray-600">
              {day}
            </div>
          ))}
          {Array.from({ length: daysInMonth[0].getDay() }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}
          {daysInMonth.map((day, index) => {
            const isPastDay = isBefore(endOfDay(day), startOfDay(new Date()));
            return (
              <button
                key={index}
                onClick={() => handleDayClick(day)}
                disabled={isPastDay}
                className={`p-2 rounded-md ${
                  isPastDay
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : selectedDay?.toDateString() === day.toDateString()
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-blue-500 hover:text-white'
                } transition-colors`}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Picker */}
      {selectedDay && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Select a Time</h2>
          <div className="flex flex-wrap gap-2">
            {availableTimes.map((time, index) => {
              const isBooked = isTimeSlotBooked(time);
              return (
                <button
                  key={index}
                  onClick={() => handleTimeClick(time)}
                  disabled={isBooked}
                  className={`p-2 rounded-md ${
                    isBooked 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed line-through'
                      : selectedTime === time
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-green-500 hover:text-white'
                  } transition-colors`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Display Selected Appointment */}
      {/* {selectedDay && selectedTime && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Your Appointment</h2>
          <p className="mb-2"><span className="font-semibold">Day:</span> {formattedSelectedDay}</p>
          <p className="mb-4"><span className="font-semibold">Time:</span> {selectedTime}</p>
        </div>
      )} */}
    </div>
  );
};

export default AppointmentScheduler;

