import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import { Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { addDays, subDays } from 'date-fns';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  allDay: boolean;
}

// Generate mock calendar events
const today = new Date();
const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Standup',
    description: 'Daily team standup meeting',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30),
    allDay: false,
  },
  {
    id: '2',
    title: 'Product Demo',
    description: 'Showcase new features to stakeholders',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 14, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 15, 30),
    allDay: false,
  },
  {
    id: '3',
    title: 'Sprint Planning',
    description: 'Plan tasks for the next sprint',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 11, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 12, 30),
    allDay: false,
  },
  {
    id: '4',
    title: 'Design Review',
    description: 'Review new UI designs with the design team',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 13, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 14, 0),
    allDay: false,
  },
  {
    id: '5',
    title: 'Company All-Hands',
    description: 'Monthly company meeting',
    start: new Date(today.getFullYear(), today.getMonth(), 15, 16, 0),
    end: new Date(today.getFullYear(), today.getMonth(), 15, 17, 0),
    allDay: false,
  },
  {
    id: '6',
    title: 'Team Building',
    description: 'Team outing - Escape Room',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10, 15, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10, 18, 0),
    allDay: false,
  },
  {
    id: '7',
    title: 'Project Deadline',
    description: 'Deadline for Q3 project deliverables',
    start: new Date(today.getFullYear(), today.getMonth(), 28, 0, 0),
    end: new Date(today.getFullYear(), today.getMonth(), 28, 23, 59),
    allDay: true,
  },
  {
    id: '8',
    title: 'Code Review',
    description: 'Review pull requests for new feature',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4, 14, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4, 15, 0),
    allDay: false,
  },
  {
    id: '9',
    title: 'Client Meeting',
    description: 'Discuss requirements with client',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 11, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 12, 0),
    allDay: false,
  },
  {
    id: '10',
    title: 'Holiday',
    description: 'Company holiday - office closed',
    start: new Date(today.getFullYear(), today.getMonth(), 25, 0, 0),
    end: new Date(today.getFullYear(), today.getMonth(), 25, 23, 59),
    allDay: true,
  }
];

export function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start: new Date(),
    end: new Date(),
    allDay: false,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      // Simulate API fetch delay
      setTimeout(() => {
        setEvents(mockEvents);
        setLoading(false);
      }, 800);
    } catch (err) {
      setError('Failed to fetch events');
      console.error('Error:', err);
    }
  }

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!newEvent.title.trim()) return;

    try {
      // Create mock event with generated ID
      const newMockEvent: CalendarEvent = {
        id: `event-${Date.now()}`,
        title: newEvent.title,
        description: newEvent.description,
        start: newEvent.start,
        end: newEvent.end,
        allDay: newEvent.allDay,
      };

      // Add to events list
      setEvents([...events, newMockEvent]);
      
      // Reset form and close dialog
      setNewEvent({
        title: '',
        description: '',
        start: new Date(),
        end: new Date(),
        allDay: false,
      });
      setShowNewEvent(false);
    } catch (err) {
      console.error('Error creating event:', err);
      alert('Failed to create event');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <button
          onClick={() => setShowNewEvent(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Event
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {showNewEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Create New Event</h2>
            <form onSubmit={createEvent}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start</label>
                    <input
                      type="datetime-local"
                      value={format(newEvent.start, "yyyy-MM-dd'T'HH:mm")}
                      onChange={(e) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End</label>
                    <input
                      type="datetime-local"
                      value={format(newEvent.end, "yyyy-MM-dd'T'HH:mm")}
                      onChange={(e) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allDay"
                    checked={newEvent.allDay}
                    onChange={(e) => setNewEvent({ ...newEvent, allDay: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="allDay" className="ml-2 block text-sm text-gray-700">
                    All day event
                  </label>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowNewEvent(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Create Event
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="h-[calc(100vh-12rem)] bg-white rounded-lg shadow p-6">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          views={['month', 'week', 'day', 'agenda']}
          defaultView="month"
        />
      </div>
    </div>
  );
}