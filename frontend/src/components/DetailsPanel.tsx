import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { EmergencyData } from '../lib/useWebSocket';

interface DetailsPanelProps {
  emergency: EmergencyData | null;
  onApproveDispatch?: (callId: string) => void;
}

export function DetailsPanel({ emergency, onApproveDispatch }: DetailsPanelProps) {
  const [isDispatching, setIsDispatching] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);

  if (!emergency) {
    return (
      <div className="h-full flex items-center justify-center bg-white p-6">
        <div className="text-center text-gray-500">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium">No emergency selected</h3>
          <p className="mt-2">Select an emergency from the list to view details</p>
        </div>
      </div>
    );
  }

  // Format timestamp
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
      return '00:00:00';
    }
  };

  // Get severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Handle dispatch button click
  const handleDispatchClick = () => {
    if (emergency && onApproveDispatch && !isDispatched) {
      setIsDispatching(true);
      
      // Simulate a short loading state before completing
      setTimeout(() => {
        onApproveDispatch(emergency.callId);
        setIsDispatching(false);
        setIsDispatched(true);
      }, 1500);
    }
  };

  return (
    <div className="h-full bg-white overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">{emergency.category} Emergency at {emergency.location}</h2>
          <div className={`px-3 py-1 rounded-full text-sm font-bold uppercase ${getSeverityColor(emergency.severity)}`}>
            {emergency.severity}
          </div>
        </div>

        {/* Image placeholder - in a real app, this would be a relevant image */}
        <div className="h-48 w-full bg-gray-200 rounded-lg mb-4 overflow-hidden relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="h-12 w-12 text-gray-400" />
          </div>
          {/* If you have an actual image: */}
          {/* <Image src="/emergency-image.jpg" alt="Emergency location" layout="fill" objectFit="cover" /> */}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Time of Call</h3>
            <p className="font-semibold">{formatTime(emergency.timestamp)}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
            <p className="font-semibold">{emergency.location}</p>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-md mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Summary</h3>
          <p className="text-sm">{emergency.action}</p>
        </div>

        <div className="bg-gray-50 p-3 rounded-md mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Recommended Actions</h3>
          <ul className="list-disc list-inside text-sm">
            {emergency.action.split('.').filter(item => item.trim()).map((item, index) => (
              <li key={index} className="mb-1">{item.trim()}</li>
            ))}
          </ul>
        </div>

        {isDispatched || emergency.dispatchApproved ? (
          <div className="w-full py-3 px-4 rounded-md font-medium text-white bg-green-600 flex items-center justify-center">
            <CheckCircle className="mr-2 h-5 w-5" />
            Responders Dispatched
          </div>
        ) : (
          <motion.button
            className={`w-full py-3 px-4 rounded-md font-medium text-white ${isDispatching ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} transition-colors flex items-center justify-center`}
            whileHover={{ scale: isDispatching ? 1 : 1.02 }}
            whileTap={{ scale: isDispatching ? 1 : 0.98 }}
            onClick={handleDispatchClick}
            disabled={isDispatching}
          >
            {isDispatching ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></span>
                Dispatching...
              </>
            ) : (
              'Dispatch First Responders'
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
}
