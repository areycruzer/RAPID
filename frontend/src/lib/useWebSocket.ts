import { useState, useEffect, useCallback } from 'react';

export type EmergencyData = {
  transcript: string;
  location: string;
  coordinates: [number, number]; // [lat, lng]
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: string;
  emotion?: {
    joy: number;
    fear: number;
    sadness: number;
    anger: number;
    surprise: number;
  };
  callId: string;
  timestamp: string;
  dispatchApproved?: boolean; // Added this property
};

// Helper functions to map data formats
function mapSeverity(severity: string): 'low' | 'medium' | 'high' | 'critical' {
  const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
    'low': 'low',
    'medium': 'medium',
    'high': 'high',
    'critical': 'critical',
    'Low': 'low',
    'Medium': 'medium',
    'High': 'high',
    'Critical': 'critical'
  };
  
  return severityMap[severity] || 'medium';
}

function mapEmotions(emotions: any): EmergencyData['emotion'] {
  if (!emotions) return undefined;
  
  // Handle different emotion data formats
  if (emotions.emotions) {
    // Format from backend mock
    return {
      joy: emotions.emotions.calm || 0,
      fear: emotions.emotions.fear || 0,
      sadness: emotions.emotions.distress || 0,
      anger: emotions.emotions.anxiety || 0,
      surprise: 0
    };
  }
  
  // Standard format
  return emotions;
}

export function useWebSocket(url: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [emergencyData, setEmergencyData] = useState<EmergencyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket connected to', url);
      setIsConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        // Transform the data if needed to match our EmergencyData type
        const emergencyData: EmergencyData = {
          callId: data.call_sid || data.callId || 'unknown',
          timestamp: data.timestamp || new Date().toISOString(),
          transcript: data.transcript || data.summary || '',
          location: data.location || 'Unknown location',
          coordinates: data.coordinates || [28.6139, 77.2090], // Default to Delhi
          category: data.emergency_type || data.category || 'Unknown',
          severity: mapSeverity(data.priority || data.severity || 'medium'),
          action: data.recommended_actions ? 
            data.recommended_actions.join('. ') : 
            data.action || 'Awaiting instructions',
          emotion: mapEmotions(data.emotions),
          dispatchApproved: data.dispatch_approved || data.dispatchApproved || false
        };
        
        console.log('Transformed emergency data:', emergencyData);
        setEmergencyData(emergencyData);
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
        setError('Failed to parse incoming data');
      }
    };

    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
      setError('WebSocket connection error');
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    setSocket(ws);

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, [url]);

  // Function to send messages to the server
  const sendMessage = useCallback(
    (message: any) => {
      if (socket && isConnected) {
        socket.send(JSON.stringify(message));
      } else {
        setError('Cannot send message: WebSocket not connected');
      }
    },
    [socket, isConnected]
  );

  return {
    isConnected,
    emergencyData,
    error,
    sendMessage,
  };
}
