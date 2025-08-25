import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  PlusCircle,
  Trash2,
  Edit,
  CheckCircle2,
  Circle,
  X,
  Flag,
  Calendar,
  User,
  Clock,
  Tag,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { TaskComments } from './TaskComments';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  assigned_to: string | null;
  tags: string[];
  user_id: string;
  position: number;
  assigned_user?: {
    email: string;
  };
}

interface ProjectMember {
  id: string;
  email: string;
}

type Priority = 'low' | 'medium' | 'high';

// Mock data for tasks
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Design new landing page',
    description: 'Create wireframes and mockups for the new marketing website',
    status: 'in-progress',
    priority: 'high',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_to: '1',
    tags: ['Design', 'Marketing'],
    user_id: 'current-user',
    position: 0,
    assigned_user: {
      email: 'jane.smith@example.com'
    }
  },
  {
    id: '2',
    title: 'Fix login page issue',
    description: 'Users are reporting inconsistent login experience on mobile devices',
    status: 'pending',
    priority: 'medium',
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_to: '2',
    tags: ['Bug', 'Mobile'],
    user_id: 'current-user',
    position: 1,
    assigned_user: {
      email: 'john.doe@example.com'
    }
  },
  {
    id: '3',
    title: 'Implement authentication',
    description: 'Add JWT authentication to API endpoints',
    status: 'completed',
    priority: 'high',
    due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_to: '3',
    tags: ['Backend', 'Security'],
    user_id: 'current-user',
    position: 2,
    assigned_user: {
      email: 'robert.johnson@example.com'
    }
  },
  {
    id: '4',
    title: 'Write API documentation',
    description: 'Create comprehensive documentation for all API endpoints',
    status: 'pending',
    priority: 'low',
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_to: '4',
    tags: ['Documentation'],
    user_id: 'current-user',
    position: 3,
    assigned_user: {
      email: 'sarah.williams@example.com'
    }
  }
];

// Mock data for project members
const mockProjectMembers: ProjectMember[] = [
  { id: '1', email: 'jane.smith@example.com' },
  { id: '2', email: 'john.doe@example.com' },
  { id: '3', email: 'robert.johnson@example.com' },
  { id: '4', email: 'sarah.williams@example.com' },
  { id: '5', email: 'michael.brown@example.com' }
];

const priorityColors: Record<Priority, { bg: string; text: string; icon: string }> = {
  low: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    icon: 'text-blue-500'
  },
  medium: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    icon: 'text-yellow-500'
  },
  high: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    icon: 'text-red-500'
  }
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800'
};

function SortableTask({ task, onStatusChange, onEdit, onDelete, onShowComments }: {
  task: Task;
  onStatusChange: (task: Task, newStatus: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onShowComments: (taskId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onStatusChange(task, task.status === 'completed' ? 'pending' : 'completed')}
              className="text-gray-400 hover:text-indigo-600 transition-colors duration-200"
            >
              {task.status === 'completed' ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : (
                <Circle className="h-6 w-6" />
              )}
            </button>
            <div>
              <h3 className={`text-lg font-medium ${
                task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
              }`}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-gray-600 mt-1">{task.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              statusColors[task.status as keyof typeof statusColors]
            }`}>
              {task.status}
            </span>
            <div className={`flex items-center ${priorityColors[task.priority as Priority].text}`}>
              <Flag className={`h-4 w-4 ${priorityColors[task.priority as Priority].icon}`} />
              <span className="ml-1 text-sm">{task.priority}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {task.assigned_to && task.assigned_user && (
              <div className="flex items-center text-gray-500">
                <User className="h-4 w-4 mr-1" />
                <span className="text-sm">{task.assigned_user.email}</span>
              </div>
            )}
            {task.due_date && (
              <div className="flex items-center text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm">
                  {format(new Date(task.due_date), 'MMM d, yyyy')}
                </span>
              </div>
            )}
            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-gray-400" />
                <div className="flex space-x-1">
                  {task.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onShowComments(task.id)}
              className="p-1 text-gray-400 hover:text-indigo-600 transition-colors duration-200"
            >
              <MessageSquare className="h-5 w-5" />
            </button>
            <button
              onClick={() => onEdit(task)}
              className="p-1 text-gray-400 hover:text-indigo-600 transition-colors duration-200"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    due_date: '',
    assigned_to: '',
    tags: [] as string[]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([
    'Bug', 'Feature', 'Documentation', 'Design', 'Testing', 'Mobile', 'Backend', 'Security', 'Marketing'
  ]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchTasks();
    fetchProjectMembers();
  }, []);

  async function fetchProjectMembers() {
    try {
      // Simulate API fetch delay
      setTimeout(() => {
        setProjectMembers(mockProjectMembers);
      }, 500);
    } catch (err) {
      console.error('Error fetching project members:', err);
      setError('Failed to fetch project members');
    }
  }

  async function fetchTasks() {
    try {
      setLoading(true);
      
      // Simulate API fetch delay
      setTimeout(() => {
        setTasks(mockTasks);
        setLoading(false);
      }, 800);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to fetch tasks');
      setLoading(false);
    }
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }
    
    setTasks(tasks => {
      const oldIndex = tasks.findIndex(task => task.id === active.id);
      const newIndex = tasks.findIndex(task => task.id === over.id);
      
      const newItems = arrayMove(tasks, oldIndex, newIndex).map((task, index) => ({
        ...task,
        position: index
      }));
      
      updateTaskPositions(newItems);
      return newItems;
    });
  }

  async function updateTaskPositions(items: Task[]) {
    // In a real app, this would update the positions in the database
    console.log('Updated task positions:', items);
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const newTaskData: Task = {
        id: Math.random().toString(36).substr(2, 9), // Generate a random ID
        title: newTask.title,
        description: newTask.description || null,
        status: 'pending',
        priority: newTask.priority,
        due_date: newTask.due_date ? new Date(newTask.due_date).toISOString() : null,
        assigned_to: newTask.assigned_to || null,
        tags: newTask.tags,
        user_id: 'current-user',
        position: tasks.length,
        assigned_user: newTask.assigned_to 
          ? { email: projectMembers.find(m => m.id === newTask.assigned_to)?.email || '' }
          : undefined
      };
      
      setTasks([...tasks, newTaskData]);
      
      // Reset form
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        assigned_to: '',
        tags: []
      });
      
      setShowNewTaskForm(false);
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to add task');
    }
  }

  async function updateTaskStatus(task: Task, newStatus: string) {
    try {
      const updatedTask = { ...task, status: newStatus };
      
      setTasks(tasks.map(t => (t.id === task.id ? updatedTask : t)));
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status');
    }
  }

  async function deleteTask(id: string) {
    try {
      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
    }
  }

  async function saveEdit(taskToEdit: Task) {
    try {
      setTasks(tasks.map(task => (task.id === taskToEdit.id ? taskToEdit : task)));
      setEditingTask(null);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task');
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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <button
          onClick={() => setShowNewTaskForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          New Task
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {showNewTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create New Task</h2>
              <button
                onClick={() => setShowNewTaskForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={addTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Priority })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    type="datetime-local"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Assign To</label>
                <select
                  value={newTask.assigned_to}
                  onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Unassigned</option>
                  {projectMembers.map(member => (
                    <option key={member.id} value={member.id}>{member.email}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tags</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const isSelected = newTask.tags.includes(tag);
                        setNewTask({
                          ...newTask,
                          tags: isSelected
                            ? newTask.tags.filter(t => t !== tag)
                            : [...newTask.tags, tag]
                        });
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        newTask.tags.includes(tag)
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewTaskForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tasks.map(task => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {tasks.map((task) => (
              <SortableTask
                key={task.id}
                task={task}
                onStatusChange={updateTaskStatus}
                onEdit={setEditingTask}
                onDelete={deleteTask}
                onShowComments={(taskId) => setSelectedTaskId(taskId)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {selectedTaskId && (
        <TaskComments
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}