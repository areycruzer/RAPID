import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Phone, 
  AlertCircle, 
  CheckCircle, 
  Settings, 
  HelpCircle,
  Users,
  BarChart3
} from 'lucide-react';
import Image from 'next/image';

interface SidebarProps {
  activeEmergencies: number;
  criticalEmergencies: number;
  resolvedEmergencies: number;
  activeSection?: string;
  onNavClick?: (section: string) => void;
}

export function Sidebar({ 
  activeEmergencies, 
  criticalEmergencies, 
  resolvedEmergencies,
  activeSection = 'dashboard',
  onNavClick
}: SidebarProps) {
  const handleNavClick = (section: string) => {
    if (onNavClick) {
      onNavClick(section);
    } else {
      console.log(`Navigated to: ${section}`);
    }
  };

  return (
    <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-10 h-10 relative">
          <Image 
            src="/dispatchLogo.png" 
            alt="DispatchAI Logo" 
            width={40} 
            height={40}
            className="rounded-md"
          />
        </div>
      </div>
      
      {/* Navigation Icons */}
      <nav className="flex-1 flex flex-col items-center space-y-6">
        <SidebarIcon 
          icon={<Home size={20} />} 
          label="Dashboard" 
          isActive={activeSection === 'dashboard'} 
          onClick={() => handleNavClick('dashboard')}
        />
        <SidebarIcon 
          icon={<Phone size={20} />} 
          label="Calls" 
          count={activeEmergencies} 
          isActive={activeSection === 'calls'} 
          onClick={() => handleNavClick('calls')}
        />
        <SidebarIcon 
          icon={<AlertCircle size={20} />} 
          label="Critical" 
          count={criticalEmergencies} 
          isActive={activeSection === 'critical'} 
          onClick={() => handleNavClick('critical')}
        />
        <SidebarIcon 
          icon={<CheckCircle size={20} />} 
          label="Resolved" 
          count={resolvedEmergencies} 
          isActive={activeSection === 'resolved'} 
          onClick={() => handleNavClick('resolved')}
        />
        <SidebarIcon 
          icon={<Users size={20} />} 
          label="Responders" 
          isActive={activeSection === 'responders'} 
          onClick={() => handleNavClick('responders')}
        />
        <SidebarIcon 
          icon={<BarChart3 size={20} />} 
          label="Analytics" 
          isActive={activeSection === 'analytics'} 
          onClick={() => handleNavClick('analytics')}
        />
      </nav>
      
      {/* Bottom Icons */}
      <div className="mt-auto flex flex-col items-center space-y-6 pt-6">
        <SidebarIcon 
          icon={<Settings size={20} />} 
          label="Settings" 
          isActive={activeSection === 'settings'} 
          onClick={() => handleNavClick('settings')}
        />
        <SidebarIcon 
          icon={<HelpCircle size={20} />} 
          label="Help" 
          isActive={activeSection === 'help'} 
          onClick={() => handleNavClick('help')}
        />
      </div>
    </div>
  );
}

interface SidebarIconProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  count?: number;
  onClick?: () => void;
}

function SidebarIcon({ icon, label, isActive = false, count, onClick }: SidebarIconProps) {
  return (
    <motion.div 
      className="relative group"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <div 
        className={`w-10 h-10 flex items-center justify-center rounded-md cursor-pointer
          ${isActive 
            ? 'bg-blue-500 text-white' 
            : 'text-gray-500 hover:bg-gray-100'
          }`}
      >
        {icon}
        
        {/* Count badge */}
        {count !== undefined && count > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
            {count > 9 ? '9+' : count}
          </div>
        )}
      </div>
      
      {/* Tooltip */}
      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity whitespace-nowrap z-10">
        {label}
      </div>
    </motion.div>
  );
}
