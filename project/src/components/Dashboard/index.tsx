import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

function TourOverlay({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const steps = [
    {
      title: "Welcome to Flowquix!",
      content: "Let's take a quick tour of your new productivity hub.",
      position: "center"
    },
    {
      title: "Task Management",
      content: "Create, organize, and track your tasks with our powerful task management system.",
      position: "right"
    },
    {
      title: "Team Collaboration",
      content: "Connect with your team in real-time through chat and file sharing.",
      position: "left"
    },
    {
      title: "Ready to Start",
      content: "You're all set! Start exploring Flowquix and boost your productivity.",
      position: "center"
    }
  ];

  const currentStep = steps[step - 1];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className={`bg-white rounded-xl shadow-2xl p-8 max-w-md mx-4 relative transform transition-all duration-300 ${
        currentStep.position === 'center' ? 'translate-x-0' :
        currentStep.position === 'right' ? 'translate-x-1/4' : '-translate-x-1/4'
      }`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{currentStep.title}</h3>
          <p className="text-gray-600">{currentStep.content}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                  idx + 1 === step ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <div className="flex space-x-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Previous
              </button>
            )}
            {step < totalSteps ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [showTour, setShowTour] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Welcome to Flowquix</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
          <h2 className="text-xl font-semibold mb-4 text-indigo-600 dark:text-indigo-400">All-in-One Platform</h2>
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300 font-medium">Replace multiple tools with a single, powerful solution:</p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
              <li>Task Management</li>
              <li>Team Communication</li>
              <li>File Storage</li>
              <li>Project Planning</li>
            </ul>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
          <h2 className="text-xl font-semibold mb-4 text-indigo-600 dark:text-indigo-400">Real-Time Collaboration</h2>
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300 font-medium">Work together seamlessly:</p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
              <li>Live Chat</li>
              <li>Instant Updates</li>
              <li>Team Presence</li>
              <li>Collaborative Editing</li>
            </ul>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
          <h2 className="text-xl font-semibold mb-4 text-indigo-600 dark:text-indigo-400">Enterprise-Ready</h2>
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300 font-medium">Scale with confidence:</p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
              <li>Role-Based Access</li>
              <li>Audit Trails</li>
              <li>Data Security</li>
              <li>Custom Workflows</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
          <p className="mb-6 text-indigo-100">Transform your workflow in minutes with our guided setup process.</p>
          <button
            onClick={() => setShowTour(true)}
            className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-colors duration-200 shadow-md"
          >
            Start Tour
          </button>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
          <p className="mb-6 text-emerald-100">Our support team is available 24/7 to assist you with any questions.</p>
          <button
            onClick={() => navigate('/support')}
            className="bg-white text-emerald-600 px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-colors duration-200 shadow-md"
          >
            Contact Support
          </button>
        </div>
      </div>

      {showTour && <TourOverlay onClose={() => setShowTour(false)} />}
    </div>
  );
}