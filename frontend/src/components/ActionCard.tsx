import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ActionCardProps {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: string;
  onApproveDispatch: () => void;
}

export function ActionCard({ category, severity, action, onApproveDispatch }: ActionCardProps) {
  const [isApproved, setIsApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Map severity to color
  const severityColor = {
    low: 'bg-emergency-low',
    medium: 'bg-emergency-medium',
    high: 'bg-emergency-high',
    critical: 'bg-emergency-critical',
  }[severity];

  const severityTextColor = {
    low: 'text-green-800',
    medium: 'text-yellow-800',
    high: 'text-red-800',
    critical: 'text-red-900',
  }[severity];

  // Handle approve button click
  const handleApprove = () => {
    setIsLoading(true);
    
    // Simulate a delay to show loading state
    setTimeout(() => {
      setIsApproved(true);
      setIsLoading(false);
      onApproveDispatch();
    }, 1000);
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md p-5 border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-4">
        <div className={`h-4 w-4 rounded-full ${severityColor} mr-2`}></div>
        <h2 className="text-lg font-semibold">Emergency Response</h2>
      </div>
      
      <div className="space-y-4">
        <div className="bg-gray-50 p-3 rounded-md">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Category</h3>
          <p className="font-semibold">{category || 'Unknown'}</p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Severity</h3>
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full ${severityColor} mr-2`}></div>
            <p className={`font-semibold capitalize ${severityTextColor}`}>{severity || 'Unknown'}</p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Recommended Action</h3>
          <p className="text-sm">{action || 'Awaiting assessment...'}</p>
        </div>
        
        {!isApproved && !isLoading && (
          <motion.button
            className="w-full py-3 px-4 rounded-md font-medium text-white 
              bg-blue-600 hover:bg-blue-700 transition-colors"
            onClick={handleApprove}
            whileTap={{ scale: 0.95 }}
          >
            Approve Dispatch
          </motion.button>
        )}
        
        {isLoading && (
          <button
            className="w-full py-3 px-4 rounded-md font-medium text-white 
              bg-blue-500 cursor-wait flex items-center justify-center"
            disabled
          >
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </button>
        )}
        
        {isApproved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full"
          >
            <div className="bg-green-100 text-green-800 p-3 rounded-md text-center mb-3">
              <svg className="w-6 h-6 mx-auto mb-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="font-medium">Dispatch Approved</p>
            </div>
            
            <button
              className="w-full py-3 px-4 rounded-md font-medium text-white 
                bg-green-500 cursor-not-allowed"
              disabled
            >
              Dispatch Approved ✓
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
