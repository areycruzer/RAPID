import React from 'react';
import { BarChart3, TrendingUp, Clock, MapPin, AlertCircle, Phone } from 'lucide-react';

interface AnalyticsViewProps {
  emergencies: Array<{
    callId: string;
    timestamp: string;
    category: string;
    severity: string;
    location: string;
    dispatchApproved?: boolean;
  }>;
}

export function AnalyticsView({ emergencies }: AnalyticsViewProps) {
  // Calculate statistics
  const totalEmergencies = emergencies.length;
  const criticalCount = emergencies.filter(e => e.severity === 'critical' || e.severity === 'high').length;
  const resolvedCount = emergencies.filter(e => e.dispatchApproved).length;
  const pendingCount = totalEmergencies - resolvedCount;
  
  // Calculate response rate
  const responseRate = totalEmergencies > 0 
    ? Math.round((resolvedCount / totalEmergencies) * 100) 
    : 0;
  
  // Calculate average response time (mock data for demo)
  const avgResponseTime = '4.2 minutes';
  
  // Calculate category distribution
  const categories = emergencies.reduce((acc, emergency) => {
    acc[emergency.category] = (acc[emergency.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Calculate severity distribution
  const severities = emergencies.reduce((acc, emergency) => {
    acc[emergency.severity] = (acc[emergency.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Get top locations
  const locations = emergencies.reduce((acc, emergency) => {
    acc[emergency.location] = (acc[emergency.location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topLocations = Object.entries(locations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="h-full bg-white p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <BarChart3 className="h-8 w-8 text-blue-500 mr-3" />
          <h1 className="text-2xl font-bold">Emergency Analytics</h1>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-500 text-sm">Total Emergencies</h3>
              <Phone className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold">{totalEmergencies}</p>
            <div className="text-xs text-gray-500 mt-2">Last 24 hours</div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-500 text-sm">Critical Emergencies</h3>
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold">{criticalCount}</p>
            <div className="text-xs text-gray-500 mt-2">
              {criticalCount > 0 && totalEmergencies > 0 ? 
                `${Math.round((criticalCount / totalEmergencies) * 100)}% of total` : 
                '0% of total'}
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-500 text-sm">Response Rate</h3>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold">{responseRate}%</p>
            <div className="text-xs text-gray-500 mt-2">
              {resolvedCount} of {totalEmergencies} resolved
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-500 text-sm">Avg. Response Time</h3>
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold">{avgResponseTime}</p>
            <div className="text-xs text-gray-500 mt-2">From call to dispatch</div>
          </div>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Emergency Types Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-medium mb-4">Emergency Types</h3>
            <div className="space-y-3">
              {Object.entries(categories).map(([category, count]) => (
                <div key={category}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">{category}</span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${(count / totalEmergencies) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Severity Distribution Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-medium mb-4">Severity Distribution</h3>
            <div className="space-y-3">
              {Object.entries(severities).map(([severity, count]) => {
                let barColor;
                switch (severity) {
                  case 'critical':
                    barColor = 'bg-red-600';
                    break;
                  case 'high':
                    barColor = 'bg-red-500';
                    break;
                  case 'medium':
                    barColor = 'bg-yellow-500';
                    break;
                  case 'low':
                    barColor = 'bg-green-500';
                    break;
                  default:
                    barColor = 'bg-gray-500';
                }
                
                return (
                  <div key={severity}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm capitalize">{severity}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`${barColor} h-2.5 rounded-full`}
                        style={{ width: `${(count / totalEmergencies) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Status and Location */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Status */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-medium mb-4">Current Status</h3>
            <div className="flex">
              <div className="w-1/2">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                        Resolved
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-green-600">
                        {resolvedCount}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                    <div style={{ width: `${responseRate}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
                  </div>
                </div>
              </div>
              
              <div className="w-1/2 pl-4">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-yellow-600 bg-yellow-200">
                        Pending
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-yellow-600">
                        {pendingCount}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-yellow-200">
                    <div style={{ width: `${100 - responseRate}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-500"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Top Locations */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-medium mb-4">Top Locations</h3>
            <div className="space-y-3">
              {topLocations.map(([location, count], index) => (
                <div key={location} className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-sm truncate">{location}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full" 
                        style={{ width: `${(count / topLocations[0][1]) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
