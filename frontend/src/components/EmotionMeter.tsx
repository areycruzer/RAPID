import React from 'react';
import { motion } from 'framer-motion';

type Emotion = 'joy' | 'fear' | 'sadness' | 'anger' | 'surprise';

interface EmotionMeterProps {
  emotions: {
    joy: number;
    fear: number;
    sadness: number;
    anger: number;
    surprise: number;
  } | null;
}

export function EmotionMeter({ emotions }: EmotionMeterProps) {
  if (!emotions) {
    return (
      <div className="bg-white h-full p-4">
        <h2 className="text-lg font-semibold mb-4">Caller Emotional State</h2>
        <div className="text-gray-500 text-center p-8">
          <p>Analyzing caller emotions...</p>
        </div>
      </div>
    );
  }

  // Get the top two emotions
  const sortedEmotions = Object.entries(emotions)
    .sort(([, valueA], [, valueB]) => valueB - valueA)
    .slice(0, 2);

  // Color mapping for emotions
  const emotionColors: Record<Emotion, string> = {
    joy: '#34C759', // Green
    fear: '#9C27B0', // Purple
    sadness: '#2196F3', // Blue
    anger: '#FF3B30', // Red
    surprise: '#FFCC00', // Yellow
  };

  return (
    <div className="bg-white h-full p-4">
      <h2 className="text-lg font-semibold mb-4">Caller Emotional State</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {sortedEmotions.map(([emotion, value], index) => (
          <EmotionCard 
            key={emotion}
            emotion={emotion as Emotion}
            value={value}
            color={emotionColors[emotion as Emotion]}
          />
        ))}
      </div>
      
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">All Emotions</h3>
        <div className="space-y-3">
          {Object.entries(emotions).map(([emotion, value]) => (
            <div key={emotion} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm capitalize">{emotion}</span>
                <span className="text-xs font-medium">{Math.round(value * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: emotionColors[emotion as Emotion] || '#9CA3AF' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${value * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface EmotionCardProps {
  emotion: Emotion;
  value: number;
  color: string;
}

function EmotionCard({ emotion, value, color }: EmotionCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex flex-col items-center">
        <div className="text-sm font-medium text-gray-500 mb-1">CALLER EMOTION</div>
        <div className="text-lg font-bold capitalize mb-1">{emotion}</div>
        <div 
          className="w-full h-2 rounded-full mt-2"
          style={{ backgroundColor: color, opacity: 0.2 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${value * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="text-sm font-medium mt-2">{Math.round(value * 100)}%</div>
      </div>
    </div>
  );
}
