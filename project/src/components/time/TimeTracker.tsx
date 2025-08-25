import React, { useState, useEffect } from 'react';
import { format, differenceInSeconds } from 'date-fns';
import {
  Play,
  Pause,
  StopCircle,
  Clock,
  Calendar,
  BarChart2,
  Filter,
  Plus,
  X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TimeEntry {
  id: string;
  description: string;
  start_time: string;
  end_time: string | null;
  duration: string | null;
  project_id: string | null;
  task_id: string | null;
  project?: {
    name: string;
  };
  task?: {
    title: string;
  };
}

interface Project {
  id: string;
  name: string;
}

interface Task {
  id: string;
  title: string;
}

export function TimeTracker() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [description, setDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [dateFilter, setDateFilter] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    fetchTimeEntries();
    fetchProjects();
    fetchTasks();
  }, [dateFilter, customStartDate, customEndDate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeEntry) {
      interval = setInterval(() => {
        const seconds = differenceInSeconds(
          new Date(),
          new Date(activeEntry.start_time)
        );
        setElapsedTime(seconds);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeEntry]);

  async function fetchTimeEntries() {
    try {
      let query = supabase
        .from('time_entries')
        .select(`
          *,
          project:project_id(name),
          task:task_id(title)
        `)
        .order('start_time', { ascending: false });

      // Apply date filters
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (dateFilter) {
        case 'today':
          query = query.gte('start_time', today.toISOString());
          break;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          query = query.gte('start_time', weekAgo.toISOString());
          break;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          query = query.gte('start_time', monthAgo.toISOString());
          break;
        case 'custom':
          if (customStartDate) {
            query = query.gte('start_time', customStartDate);
          }
          if (customEndDate) {
            query = query.lte('start_time', customEndDate);
          }
          break;
      }

      const { data, error } = await query;

      if (error) throw error;
      setTimeEntries(data || []);

      // Check for active entry
      const active = data?.find(entry => !entry.end_time);
      if (active) {
        setActiveEntry(active);
        setDescription(active.description);
        setSelectedProject(active.project_id || '');
        setSelectedTask(active.task_id || '');
      }
    } catch (err) {
      setError('Failed to fetch time entries');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  }

  async function fetchTasks() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title')
        .order('title');

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  }

  async function startTimer() {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert([{
          description,
          project_id: selectedProject || null,
          task_id: selectedTask || null,
          start_time: new Date().toISOString()
        }])
        .select(`
          *,
          project:project_id(name),
          task:task_id(title)
        `)
        .single();

      if (error) throw error;
      setActiveEntry(data);
      setElapsedTime(0);
      fetchTimeEntries();
    } catch (err) {
      setError('Failed to start timer');
      console.error('Error:', err);
    }
  }

  async function stopTimer() {
    if (!activeEntry) return;

    try {
      const { error } = await supabase
        .from('time_entries')
        .update({
          end_time: new Date().toISOString(),
          duration: `${elapsedTime} seconds`
        })
        .eq('id', activeEntry.id);

      if (error) throw error;
      setActiveEntry(null);
      setElapsedTime(0);
      setDescription('');
      setSelectedProject('');
      setSelectedTask('');
      fetchTimeEntries();
    } catch (err) {
      setError('Failed to stop timer');
      console.error('Error:', err);
    }
  }

  async function createManualEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!description || !customStartDate || !customEndDate) return;

    try {
      const { error } = await supabase
        .from('time_entries')
        .insert([{
          description,
          project_id: selectedProject || null,
          task_id: selectedTask || null,
          start_time: customStartDate,
          end_time: customEndDate,
          duration: `${differenceInSeconds(
            new Date(customEndDate),
            new Date(customStartDate)
          )} seconds`
        }]);

      if (error) throw error;
      setShowNewEntry(false);
      setDescription('');
      setSelectedProject('');
      setSelectedTask('');
      setCustomStartDate('');
      setCustomEndDate('');
      fetchTimeEntries();
    } catch (err) {
      setError('Failed to create time entry');
      console.error('Error:', err);
    }
  }

  function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowNewEntry(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Manual Entry
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {/* Timer Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are you working on?"
            className="flex-1 rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={!!activeEntry}
          />
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={!!activeEntry}
          >
            <option value="">No Project</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          <select
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value)}
            className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={!!activeEntry}
          >
            <option value="">No Task</option>
            {tasks.map(task => (
              <option key={task.id} value={task.id}>{task.title}</option>
            ))}
          </select>
          {activeEntry ? (
            <button
              onClick={stopTimer}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <StopCircle className="h-5 w-5 mr-2" />
              Stop
            </button>
          ) : (
            <button
              onClick={startTimer}
              disabled={!description}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-5 w-5 mr-2" />
              Start
            </button>
          )}
        </div>
        {activeEntry && (
          <div className="text-center text-2xl font-mono text-indigo-600">
            {formatDuration(elapsedTime)}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>
          {dateFilter === 'custom' && (
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span>to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Time Entries List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200">
          {timeEntries.map(entry => (
            <div key={entry.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {entry.description}
                  </h3>
                  <div className="mt-1 text-sm text-gray-500 space-x-4">
                    {entry.project && (
                      <span className="inline-flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {entry.project.name}
                      </span>
                    )}
                    {entry.task && (
                      <span className="inline-flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {entry.task.title}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {entry.end_time ? (
                      format(new Date(entry.start_time), 'h:mm a')
                      + ' - ' +
                      format(new Date(entry.end_time), 'h:mm a')
                    ) : (
                      'In Progress'
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(entry.start_time), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Entry Dialog */}
      {showNewEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Time Entry</h2>
              <button
                onClick={() => setShowNewEntry(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={createManualEntry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="What did you work on?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Project
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">No Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Task
                </label>
                <select
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">No Task</option>
                  {tasks.map(task => (
                    <option key={task.id} value={task.id}>{task.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewEntry(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Add Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}