import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Users, Clock, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';

interface AnalyticsData {
  tasks: {
    total: number;
    completed: number;
    trend: number;
  };
  timeTracked: {
    total: number;
    thisWeek: number;
    trend: number;
  };
  teamActivity: {
    activeUsers: number;
    trend: number;
  };
  upcomingDeadlines: {
    total: number;
    thisWeek: number;
  };
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData>({
    tasks: { total: 0, completed: 0, trend: 0 },
    timeTracked: { total: 0, thisWeek: 0, trend: 0 },
    teamActivity: { activeUsers: 0, trend: 0 },
    upcomingDeadlines: { total: 0, thisWeek: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError('Please sign in to view analytics');
          setLoading(false);
          return;
        }
        
        // Just simulate loading analytics data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In a real app, we would fetch actual analytics data from the backend
        setData({
          tasks: {
            total: 10, // Example data
            completed: 8, // Example data
            trend: 5 // Example trend calculation
          },
          timeTracked: {
            total: 20, // Example data
            thisWeek: 15, // Example data
            trend: 10 // Example trend calculation
          },
          teamActivity: {
            activeUsers: 15, // Example data
            trend: 8
          },
          upcomingDeadlines: {
            total: 12, // Example data
            thisWeek: 5
          }
        });
      } catch (err) {
        setError('Failed to load analytics data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-1 text-gray-500">Track your team's performance and productivity</p>
        </div>
        <div className="flex items-center space-x-4">
          <select className="rounded-lg border-gray-300 text-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Task Completion */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="bg-blue-100 p-3 rounded-lg">
              <BarChart2 className="h-6 w-6 text-blue-600" />
            </div>
            <span className={`flex items-center text-sm ${
              data.tasks.trend > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {data.tasks.trend > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              {Math.abs(data.tasks.trend)}%
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mt-4">Task Completion</h3>
          <div className="mt-2">
            <span className="text-2xl font-bold text-gray-900">{data.tasks.completed}</span>
            <span className="text-gray-500 ml-2">/ {data.tasks.total}</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">Completed tasks this period</p>
        </div>

        {/* Time Tracked */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <span className={`flex items-center text-sm ${
              data.timeTracked.trend > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {data.timeTracked.trend > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              {Math.abs(data.timeTracked.trend)}%
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mt-4">Time Tracked</h3>
          <div className="mt-2">
            <span className="text-2xl font-bold text-gray-900">{data.timeTracked.thisWeek}</span>
            <span className="text-gray-500 ml-2">hours</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">Total hours tracked this week</p>
        </div>

        {/* Team Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <span className={`flex items-center text-sm ${
              data.teamActivity.trend > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {data.teamActivity.trend > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              {Math.abs(data.teamActivity.trend)}%
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mt-4">Team Activity</h3>
          <div className="mt-2">
            <span className="text-2xl font-bold text-gray-900">{data.teamActivity.activeUsers}</span>
            <span className="text-gray-500 ml-2">active users</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">Active team members today</p>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="bg-red-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mt-4">Upcoming Deadlines</h3>
          <div className="mt-2">
            <span className="text-2xl font-bold text-gray-900">{data.upcomingDeadlines.thisWeek}</span>
            <span className="text-gray-500 ml-2">this week</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">Out of {data.upcomingDeadlines.total} total deadlines</p>
        </div>
      </div>

      {/* Additional analytics sections can be added here */}
    </div>
  );
}