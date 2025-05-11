import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface HeaderProps {
  isConnected: boolean;
}

export function Header({ isConnected }: HeaderProps) {
  return (
    <motion.header 
      className="flex items-center justify-between p-4 mb-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow-md"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center">
        <div className="relative h-12 w-12 mr-3">
          <Image 
            src="/images/lit-logo.svg" 
            alt="LIT Logo" 
            width={48} 
            height={48}
            className="object-contain"
            priority
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold">LIT Emergency Response</h1>
          <p className="text-sm text-blue-100">Lifeline Inside Telephone</p>
        </div>
      </div>
      
      <div className="flex items-center">
        <div className={`h-3 w-3 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-500'}`}></div>
        <p className="text-sm">
          {isConnected ? 'Connected to emergency service' : 'Disconnected from emergency service'}
        </p>
      </div>
    </motion.header>
  );
}
