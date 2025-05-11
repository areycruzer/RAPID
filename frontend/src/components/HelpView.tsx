import React from 'react';
import { HelpCircle, Phone, AlertCircle, CheckCircle, Users, BarChart3, Settings } from 'lucide-react';

export function HelpView() {
  return (
    <div className="h-full bg-white p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <HelpCircle className="h-8 w-8 text-blue-500 mr-3" />
          <h1 className="text-2xl font-bold">Help & Support</h1>
        </div>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
          <p className="text-blue-700">
            This is the LIT Emergency Response Dashboard. Below you'll find information about how to use the system.
          </p>
        </div>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">Navigation Guide</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-md mr-3">
                    <Phone size={20} />
                  </div>
                  <h3 className="font-medium">Calls</h3>
                </div>
                <p className="text-sm text-gray-600">View all active emergency calls. This section displays all incoming calls that require attention.</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-md mr-3">
                    <AlertCircle size={20} />
                  </div>
                  <h3 className="font-medium">Critical</h3>
                </div>
                <p className="text-sm text-gray-600">View high priority emergencies that require immediate attention. These are filtered based on severity.</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-md mr-3">
                    <CheckCircle size={20} />
                  </div>
                  <h3 className="font-medium">Resolved</h3>
                </div>
                <p className="text-sm text-gray-600">View emergencies that have been addressed. This section shows calls where responders have been dispatched.</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-md mr-3">
                    <Users size={20} />
                  </div>
                  <h3 className="font-medium">Responders</h3>
                </div>
                <p className="text-sm text-gray-600">View and manage emergency responders. Track their status, location, and availability.</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-md mr-3">
                    <BarChart3 size={20} />
                  </div>
                  <h3 className="font-medium">Analytics</h3>
                </div>
                <p className="text-sm text-gray-600">View emergency response statistics and trends. Analyze response times and outcomes.</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-md mr-3">
                    <Settings size={20} />
                  </div>
                  <h3 className="font-medium">Settings</h3>
                </div>
                <p className="text-sm text-gray-600">Configure dashboard preferences, notification settings, and user account information.</p>
              </div>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Emergency Response Process</h2>
            <ol className="list-decimal pl-5 space-y-3">
              <li className="text-gray-700">
                <span className="font-medium">Call Received</span> - When a call comes in, it appears in the Calls section with details about the caller and situation.
              </li>
              <li className="text-gray-700">
                <span className="font-medium">Triage</span> - The system automatically assesses the severity of the emergency and categorizes it.
              </li>
              <li className="text-gray-700">
                <span className="font-medium">Review Details</span> - Click on an emergency to view its details, including location, transcript, and emotional analysis.
              </li>
              <li className="text-gray-700">
                <span className="font-medium">Dispatch</span> - After reviewing, click "Dispatch First Responders" to send help to the location.
              </li>
              <li className="text-gray-700">
                <span className="font-medium">Monitor</span> - Track the status of the emergency and responders in real-time.
              </li>
              <li className="text-gray-700">
                <span className="font-medium">Resolution</span> - Once addressed, the emergency moves to the Resolved section.
              </li>
            </ol>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Keyboard Shortcuts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Navigate to Dashboard</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm">D</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Navigate to Calls</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm">C</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Navigate to Critical</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm">!</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Navigate to Resolved</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm">R</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Approve Dispatch</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm">Space</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Toggle Sidebar</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm">S</kbd>
              </div>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Contact Support</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="mb-3">If you need assistance with the LIT Emergency Response system, please contact:</p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="font-medium w-24">Email:</span>
                  <a href="mailto:support@lit-emergency.com" className="text-blue-600 hover:underline">support@lit-emergency.com</a>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-24">Phone:</span>
                  <span>1-800-LIT-HELP (1-800-548-4357)</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-24">Hours:</span>
                  <span>24/7 Technical Support</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
