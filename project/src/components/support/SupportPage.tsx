import React, { useState } from 'react';
import { HelpCircle, Send, Check } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

export function SupportPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject || !message) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // In a real application, this would submit to a backend API
      // For demo purposes, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitted(true);
      setSubject('');
      setMessage('');
      setCategory('general');
    } catch (err) {
      setError('Failed to submit support request. Please try again later.');
      console.error('Support request error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Contact Support</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Need help with PulseHub? Our support team is here to assist you.
        </p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-100 rounded">
          {error}
        </div>
      )}
      
      {submitted ? (
        <div className="bg-green-100 dark:bg-green-900 p-6 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center mb-4">
            <div className="bg-green-500 rounded-full p-2 mr-3">
              <Check className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Request Submitted</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Thank you for contacting us. We've received your support request and will get back to you as soon as possible. You'll receive a confirmation email shortly.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-gray-800 dark:text-gray-200 transition-colors"
          >
            Submit another request
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="general">General Question</option>
                <option value="technical">Technical Issue</option>
                <option value="billing">Billing Question</option>
                <option value="feature">Feature Request</option>
                <option value="account">Account Management</option>
              </select>
            </div>
            
            <div className="mb-6">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Briefly describe your issue"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                required
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Please provide details about your question or issue"
              ></textarea>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Information
              </label>
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Email:</span> {user?.email || 'Not available'}
                </p>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="mt-10 bg-indigo-50 dark:bg-gray-800 p-6 rounded-lg border border-indigo-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <HelpCircle className="mr-2 h-5 w-5 text-indigo-500" />
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">How do I reset my password?</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">You can reset your password by clicking on "Forgot password?" on the login page.</p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Can I change my subscription plan?</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Yes, you can upgrade or downgrade your subscription from the Settings → Billing section.</p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">How do I invite team members?</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Navigate to the Team page and click on "Invite Members" to send invitations via email.</p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Is my data secure?</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Yes, all data is encrypted in transit and at rest. We use industry-standard security practices.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 