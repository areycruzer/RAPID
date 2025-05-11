import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, MapPin, Phone } from 'lucide-react';
import { EmergencyData } from '../lib/useWebSocket';

interface EventPanelProps {
  emergencies: EmergencyData[];
  activeEmergencyId: string | null;
  onSelectEmergency: (emergency: EmergencyData) => void;
}

export function EventPanel({ emergencies, activeEmergencyId, onSelectEmergency }: EventPanelProps) {
  // Format timestamp to display only time
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '00:00';
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Handle emergency item click
  const handleEmergencyClick = (emergency: EmergencyData) => {
    onSelectEmergency(emergency);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Active Emergencies</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {emergencies.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {emergencies.map((emergency) => (
              <motion.div
                key={emergency.callId}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  activeEmergencyId === emergency.callId ? 'bg-blue-50' : ''
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => handleEmergencyClick(emergency)}
                whileHover={{ backgroundColor: activeEmergencyId === emergency.callId ? '#EBF5FF' : '#F9FAFB' }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-start">
                  {/* Severity indicator */}
                  <div className={`h-3 w-3 rounded-full mt-1 mr-3 ${getSeverityColor(emergency.severity)}`}></div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{emergency.category} Emergency</h3>
                      <span className="text-xs text-gray-500">{formatTime(emergency.timestamp)}</span>
                    </div>
                    
                    <div className="mt-1 text-sm text-gray-600 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate">{emergency.location}</span>
                    </div>
                    
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <Phone className="h-3 w-3 mr-1" />
                      <span>Call ID: {emergency.callId.substring(0, 8)}...</span>
                    </div>
                    
                    {emergency.dispatchApproved && (
                      <div className="mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded inline-flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Dispatch Approved</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-6 text-gray-500">
            <AlertCircle className="h-12 w-12 mb-4 text-gray-300" />
            <p className="text-center">No active emergencies</p>
            <p className="text-sm text-center mt-2">Emergencies will appear here when calls are received</p>
          </div>
        )}
      </div>
    </div>
  );
}
