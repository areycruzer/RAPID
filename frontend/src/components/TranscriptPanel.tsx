import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

interface TranscriptPanelProps {
  transcript: string;
}

export function TranscriptPanel({ transcript }: TranscriptPanelProps) {
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when transcript updates
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  // Split transcript into lines for animation
  const lines = transcript.split('\n').filter(line => line.trim() !== '');

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="h-2 w-2 rounded-full bg-green-500 mr-2 relative">
            <span className="absolute -top-1 -left-1 h-4 w-4 rounded-full bg-green-500 animate-pulse-ring opacity-75"></span>
          </div>
          <h2 className="text-lg font-semibold">Live Transcript</h2>
        </div>
      </div>
      
      <div 
        ref={transcriptRef}
        className="flex-1 overflow-y-auto p-4"
      >
        {lines.length > 0 ? (
          <div className="space-y-4">
            {lines.map((line, index) => {
              // Determine if this is an AI message or a caller message
              const isAI = index % 2 === 0;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-3 ${
                      isAI 
                        ? 'bg-gray-100 text-gray-800' 
                        : 'bg-blue-500 text-white'
                    }`}
                  >
                    <div className="text-xs mb-1 font-medium">
                      {isAI ? 'AI Operator' : 'Caller'}
                    </div>
                    <p className="text-sm">{line}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <MessageSquare className="h-12 w-12 mb-4 text-gray-300" />
            <p className="text-center">Waiting for emergency call transcript...</p>
            <p className="text-sm text-center mt-2">Transcript will appear here when a call is received</p>
          </div>
        )}
      </div>
    </div>
  );
}
