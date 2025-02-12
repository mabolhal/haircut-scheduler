'use client';

import React from 'react';

interface Appointment {
  title: string;
  start: Date;
  end: Date;
  customer: string;
  service: string;
}

interface AppointmentModalProps {
  appointment: Appointment;
  onClose: () => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ appointment, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Appointment Details</h2>
        <p><strong>Customer:</strong> {appointment.customer}</p>
        <p><strong>Service:</strong> {appointment.title}</p>
        <p><strong>Start Time:</strong> {appointment.start.toString()}</p>
        <p><strong>End Time:</strong> {appointment.end.toString()}</p>
        <button onClick={onClose} className="mt-4 bg-blue-600 text-white rounded p-2">
          Close
        </button>
      </div>
    </div>
  );
};

export default AppointmentModal; 