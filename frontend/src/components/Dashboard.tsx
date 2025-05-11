import React, { useEffect, useState } from 'react';
import { TranscriptPanel } from './TranscriptPanel';
import { MapPanel } from './MapPanel';
import { EmotionMeter } from './EmotionMeter';
import { EventPanel } from './EventPanel';
import { DetailsPanel } from './DetailsPanel';
import { Sidebar } from './Sidebar';
import { HelpView } from './HelpView';
import { AnalyticsView } from './AnalyticsView';
import { SettingsView } from './SettingsView';
import { useWebSocket, EmergencyData } from '../lib/useWebSocket';
import { motion } from 'framer-motion';
import { Menu, X, ChevronLeft, AlertTriangle, Info, Settings, Users, BarChart3 } from 'lucide-react';

interface DashboardProps {
  wsUrl: string;
}

// Mock emergency data for testing
const MOCK_EMERGENCIES: EmergencyData[] = [
  {
    callId: "call-1683924500",
    timestamp: new Date().toISOString(),
    transcript: "Caller: Help! There's been a car accident on Highway 101.\nAI: I understand there's been a car accident. Are there any injuries?\nCaller: Yes, I think someone is hurt. There's a person who can't get out of their car.\nAI: I'm dispatching emergency services right away. Can you tell me exactly where on Highway 101?\nCaller: It's near the exit for Main Street, heading north.\nAI: Thank you. Emergency services are on their way. Please stay on the line.",
    location: "Highway 101 near Main Street exit",
    coordinates: [37.7749, -122.4194],
    category: "Traffic Accident",
    severity: "high",
    action: "Dispatch ambulance to Highway 101 near Main Street exit. Alert traffic control to divert traffic. Notify nearest hospital of potential incoming trauma patient.",
    emotion: {
      joy: 0.1,
      fear: 0.6,
      sadness: 0.5,
      anger: 0.2,
      surprise: 0.3
    },
    dispatchApproved: false
  },
  {
    callId: "call-1683924600",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    transcript: "Caller: I need help! There's smoke coming from my neighbor's apartment.\nAI: I understand there's smoke. Is there visible fire?\nCaller: I don't see flames, just a lot of smoke coming from under the door.\nAI: I'm sending firefighters immediately. What's the address?\nCaller: 123 Oak Street, Apartment 4B.\nAI: Thank you. Fire department is on their way. Is the building being evacuated?\nCaller: Yes, people are leaving now.",
    location: "123 Oak Street, Apartment 4B",
    coordinates: [37.7694, -122.4862],
    category: "Fire",
    severity: "critical",
    action: "Dispatch fire department to 123 Oak Street. Ensure building evacuation. Alert nearby residents.",
    emotion: {
      joy: 0.05,
      fear: 0.8,
      sadness: 0.3,
      anger: 0.4,
      surprise: 0.6
    },
    dispatchApproved: false
  },
  {
    callId: "call-1683924700",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    transcript: "Caller: Hello, I think my neighbor has fallen and can't get up. I can hear her calling for help.\nAI: I understand your concern. Is your neighbor elderly or has any known medical conditions?\nCaller: Yes, she's in her 80s and lives alone. I think she might have fallen.\nAI: Thank you for that information. What's the address?\nCaller: It's 456 Maple Avenue, the house with the blue door.\nAI: I'm sending medical assistance right away. Can you stay on the line?",
    location: "456 Maple Avenue",
    coordinates: [37.7835, -122.4506],
    category: "Medical",
    severity: "medium",
    action: "Dispatch medical assistance to 456 Maple Avenue. Advise caller to check on neighbor if safe to do so. Notify next of kin if information available.",
    emotion: {
      joy: 0.1,
      fear: 0.4,
      sadness: 0.6,
      anger: 0.1,
      surprise: 0.2
    },
    dispatchApproved: false
  }
];

// Define the different view types
type ViewType = 'dashboard' | 'calls' | 'critical' | 'resolved' | 'responders' | 'analytics' | 'settings' | 'help';

export function Dashboard({ wsUrl }: DashboardProps) {
  const { isConnected, emergencyData, error, sendMessage } = useWebSocket(wsUrl);
  const [activeCall, setActiveCall] = useState<EmergencyData | null>(null);
  const [emergencies, setEmergencies] = useState<EmergencyData[]>([]);
  const [activeSection, setActiveSection] = useState<ViewType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileView, setMobileView] = useState<'list' | 'details' | 'transcript'>('list');
  const [isMobile, setIsMobile] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check on mount
    checkIfMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Initialize with mock data
  useEffect(() => {
    // Only use mock data if no real data is coming in
    if (emergencies.length === 0) {
      console.log("Loading mock emergency data");
      setEmergencies(MOCK_EMERGENCIES);
      setActiveCall(MOCK_EMERGENCIES[0]);
    }
  }, [emergencies.length]);

  // Update emergencies list and active call when new emergency data is received
  useEffect(() => {
    if (emergencyData) {
      console.log("Received real emergency data:", emergencyData);
      // Add to emergencies list if not already present
      setEmergencies(prev => {
        const exists = prev.some(e => e.callId === emergencyData.callId);
        if (exists) {
          return prev.map(e => e.callId === emergencyData.callId ? emergencyData : e);
        } else {
          return [...prev, emergencyData];
        }
      });
      
      // Set as active call
      setActiveCall(emergencyData);
      
      // On mobile, switch to details view for new emergencies
      if (isMobile) {
        setMobileView('details');
      }
    }
  }, [emergencyData, isMobile]);

  // Handle selecting an emergency
  const handleSelectEmergency = (emergency: EmergencyData) => {
    console.log("Selected emergency:", emergency.callId);
    setActiveCall(emergency);
    
    // On mobile, switch to details view when selecting an emergency
    if (isMobile) {
      setMobileView('details');
    }
  };

  // Handle dispatch approval
  const handleApproveDispatch = (callId: string) => {
    console.log("Approving dispatch for:", callId);
    // Update local state first
    setEmergencies(prev => 
      prev.map(e => 
        e.callId === callId 
          ? { ...e, dispatchApproved: true } 
          : e
      )
    );
    
    // If the active call is the one being approved, update it too
    if (activeCall && activeCall.callId === callId) {
      setActiveCall({ ...activeCall, dispatchApproved: true });
    }
    
    // Send message to backend
    sendMessage({
      type: 'dispatch_approved',
      callId: callId,
      timestamp: new Date().toISOString()
    });
    
    console.log('Dispatch approved for call:', callId);
    
    // Show notification
    showTemporaryNotification('Dispatch approved successfully!');
  };

  // Add a new mock emergency
  const addMockEmergency = () => {
    const newEmergency: EmergencyData = {
      callId: `call-${Date.now()}`,
      timestamp: new Date().toISOString(),
      transcript: "Caller: I need police! Someone is trying to break into my house!\nAI: I understand this is a serious situation. Are you in a safe location?\nCaller: Yes, I'm locked in the bathroom upstairs.\nAI: I'm sending police immediately. What's your address?\nCaller: 789 Pine Street\nAI: Officers are on their way. Stay on the line with me.",
      location: "789 Pine Street",
      coordinates: [37.7935, -122.4316],
      category: "Police",
      severity: "critical",
      action: "Dispatch police units to 789 Pine Street immediately. Advise caller to remain in safe location. Notify nearby patrol units.",
      emotion: {
        joy: 0.0,
        fear: 0.9,
        sadness: 0.2,
        anger: 0.5,
        surprise: 0.4
      },
      dispatchApproved: false
    };
    
    console.log("Adding new mock emergency");
    setEmergencies(prev => [...prev, newEmergency]);
    setActiveCall(newEmergency);
    
    // On mobile, switch to details view for new emergencies
    if (isMobile) {
      setMobileView('details');
    }
    
    // Show notification
    showTemporaryNotification('New emergency added!');
  };

  // Show a temporary notification
  const showTemporaryNotification = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    
    // Hide after 3 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // Handle sidebar navigation with specific actions for each section
  const handleNavClick = (section: ViewType) => {
    console.log(`Navigated to: ${section}`);
    setActiveSection(section);
    
    // Perform specific actions based on the selected section
    switch (section) {
      case 'dashboard':
        // Show all emergencies
        setActiveCall(emergencies[0] || null);
        showTemporaryNotification('Dashboard view activated');
        break;
        
      case 'calls':
        // Show all active calls
        setActiveCall(emergencies[0] || null);
        showTemporaryNotification(`Viewing ${emergencies.length} active calls`);
        break;
        
      case 'critical':
        // Filter and show only critical emergencies
        const criticalEmergencies = emergencies.filter(e => 
          e.severity === 'critical' || e.severity === 'high'
        );
        if (criticalEmergencies.length > 0) {
          setActiveCall(criticalEmergencies[0]);
          showTemporaryNotification(`Viewing ${criticalEmergencies.length} critical emergencies`);
        } else {
          showTemporaryNotification('No critical emergencies at this time');
        }
        break;
        
      case 'resolved':
        // Filter and show only resolved emergencies
        const resolvedEmergencies = emergencies.filter(e => e.dispatchApproved);
        if (resolvedEmergencies.length > 0) {
          setActiveCall(resolvedEmergencies[0]);
          showTemporaryNotification(`Viewing ${resolvedEmergencies.length} resolved emergencies`);
        } else {
          showTemporaryNotification('No resolved emergencies at this time');
        }
        break;
        
      case 'responders':
        showTemporaryNotification('Viewing responders management');
        break;
        
      case 'analytics':
        showTemporaryNotification('Viewing analytics dashboard');
        break;
        
      case 'settings':
        showTemporaryNotification('Viewing system settings');
        break;
        
      case 'help':
        showTemporaryNotification('Viewing help & support');
        break;
    }
    
    // On mobile, collapse sidebar after selection
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Get filtered emergencies based on active section
  const getFilteredEmergencies = () => {
    switch (activeSection) {
      case 'critical':
        return emergencies.filter(e => e.severity === 'critical' || e.severity === 'high');
      case 'resolved':
        return emergencies.filter(e => e.dispatchApproved);
      default:
        return emergencies;
    }
  };

  // Render mobile view
  const renderMobileView = () => {
    const filteredEmergencies = getFilteredEmergencies();
    
    // Render specific views based on active section
    if (activeSection === 'help') {
      return <HelpView />;
    }
    
    if (activeSection === 'analytics') {
      return <AnalyticsView emergencies={emergencies} />;
    }
    
    if (activeSection === 'settings') {
      return <SettingsView />;
    }
    
    switch (mobileView) {
      case 'list':
        return (
          <div className="h-full">
            <EventPanel 
              emergencies={filteredEmergencies}
              activeEmergencyId={activeCall?.callId || null}
              onSelectEmergency={handleSelectEmergency}
            />
          </div>
        );
      case 'details':
        return (
          <div className="h-full flex flex-col">
            <div className="p-2 border-b border-gray-200">
              <button 
                onClick={() => setMobileView('list')}
                className="flex items-center text-blue-600"
              >
                <ChevronLeft size={16} />
                <span>Back to List</span>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="h-1/2">
                <MapPanel 
                  location={activeCall?.location || ''} 
                  coordinates={activeCall?.coordinates || [28.6139, 77.2090]} 
                />
              </div>
              <div className="h-1/2 overflow-y-auto">
                <DetailsPanel 
                  emergency={activeCall} 
                  onApproveDispatch={handleApproveDispatch}
                />
              </div>
            </div>
            <div className="p-2 border-t border-gray-200">
              <button 
                onClick={() => setMobileView('transcript')}
                className="w-full py-2 bg-blue-50 text-blue-600 rounded-md"
              >
                View Transcript & Emotions
              </button>
            </div>
          </div>
        );
      case 'transcript':
        return (
          <div className="h-full flex flex-col">
            <div className="p-2 border-b border-gray-200">
              <button 
                onClick={() => setMobileView('details')}
                className="flex items-center text-blue-600"
              >
                <ChevronLeft size={16} />
                <span>Back to Details</span>
              </button>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="h-2/3 overflow-hidden">
                <TranscriptPanel transcript={activeCall?.transcript || ''} />
              </div>
              <div className="h-1/3 overflow-hidden">
                <EmotionMeter emotions={activeCall?.emotion || null} />
              </div>
            </div>
          </div>
        );
    }
  };

  // Render desktop view
  const renderDesktopView = () => {
    const filteredEmergencies = getFilteredEmergencies();
    
    // Render specific views based on active section
    if (activeSection === 'help') {
      return <HelpView />;
    }
    
    if (activeSection === 'analytics') {
      return <AnalyticsView emergencies={emergencies} />;
    }
    
    if (activeSection === 'settings') {
      return <SettingsView />;
    }
    
    return (
      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        {/* Left panel - Emergency list */}
        {sidebarOpen && (
          <div className="col-span-3 border-r border-gray-200 overflow-hidden">
            <EventPanel 
              emergencies={filteredEmergencies}
              activeEmergencyId={activeCall?.callId || null}
              onSelectEmergency={handleSelectEmergency}
            />
          </div>
        )}
        
        {/* Middle panel - Map and Details */}
        <div className={`${sidebarOpen ? 'col-span-5' : 'col-span-8'} flex flex-col overflow-hidden`}>
          {/* Map */}
          <div className="h-1/2 border-b border-gray-200">
            <MapPanel 
              location={activeCall?.location || ''} 
              coordinates={activeCall?.coordinates || [28.6139, 77.2090]} 
            />
          </div>
          
          {/* Details */}
          <div className="h-1/2 overflow-y-auto">
            <DetailsPanel 
              emergency={activeCall} 
              onApproveDispatch={handleApproveDispatch}
            />
          </div>
        </div>
        
        {/* Right panel - Transcript and Emotions */}
        <div className="col-span-4 border-l border-gray-200 flex flex-col overflow-hidden">
          {/* Transcript */}
          <div className="h-2/3 border-b border-gray-200 overflow-hidden">
            <TranscriptPanel transcript={activeCall?.transcript || ''} />
          </div>
          
          {/* Emotions */}
          <div className="h-1/3 overflow-hidden">
            <EmotionMeter emotions={activeCall?.emotion || null} />
          </div>
        </div>
      </div>
    );
  };

  // Render section title based on active section
  const getSectionTitle = () => {
    switch (activeSection) {
      case 'dashboard': return 'Dashboard';
      case 'calls': return 'Active Calls';
      case 'critical': return 'Critical Emergencies';
      case 'resolved': return 'Resolved Emergencies';
      case 'responders': return 'First Responders';
      case 'analytics': return 'Analytics';
      case 'settings': return 'Settings';
      case 'help': return 'Help & Support';
      default: return 'LIT Emergency Response';
    }
  };

  return (
    <div className="flex h-screen bg-dispatch-background overflow-hidden">
      {/* Sidebar - only visible on desktop or when toggled on mobile */}
      {(!isMobile || (isMobile && sidebarOpen)) && (
        <Sidebar 
          activeEmergencies={emergencies.length} 
          criticalEmergencies={emergencies.filter(e => e.severity === 'critical' || e.severity === 'high').length}
          resolvedEmergencies={emergencies.filter(e => e.dispatchApproved).length}
          activeSection={activeSection}
          onNavClick={handleNavClick}
        />
      )}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4">
          {/* Mobile menu toggle */}
          {isMobile && (
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-3"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
          
          <div className="flex items-center">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
            <h1 className="font-bold text-lg">{getSectionTitle()}</h1>
          </div>
          
          <div className="ml-auto flex items-center space-x-4">
            {/* Add mock emergency button */}
            <button 
              onClick={addMockEmergency}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition-colors"
            >
              Add Mock Emergency
            </button>
            
            {!isMobile && (
              <>
                <div className="text-sm text-gray-600">
                  {new Date().toLocaleString('en-US', { 
                    hour: 'numeric', 
                    minute: 'numeric', 
                    second: 'numeric',
                    hour12: true 
                  })}
                </div>
                <div className="text-sm font-medium">
                  SAN FRANCISCO, CA
                </div>
              </>
            )}
          </div>
        </header>
        
        {/* Main content area - conditional rendering based on screen size */}
        {isMobile ? renderMobileView() : renderDesktopView()}
      </div>
      
      {/* Notification toast */}
      {showNotification && (
        <motion.div 
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
        >
          {notificationMessage}
        </motion.div>
      )}
      
      {/* Error notification */}
      {error && (
        <div className="absolute bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
