import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import {
  LayoutDashboard,
  CheckSquare,
  Kanban,
  Users,
  FolderOpen,
  MessageSquare,
  Clock,
  Calendar,
  Settings,
  Workflow,
  FileImage,
  Trophy,
  BarChart2
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
  { name: 'Projects', icon: Kanban, path: '/projects' },
  { name: 'Team', icon: Users, path: '/team' },
  { name: 'Files', icon: FolderOpen, path: '/files' },
  { name: 'Messages', icon: MessageSquare, path: '/messages' },
  { name: 'Time Tracking', icon: Clock, path: '/time' },
  { name: 'Calendar', icon: Calendar, path: '/calendar' },
  { name: 'Assets', icon: FileImage, path: '/assets' },
  { name: 'Achievements', icon: Trophy, path: '/achievements' },
  { name: 'Analytics', icon: BarChart2, path: '/analytics' },
];

export function Sidebar() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-64 flex-col bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      <div className="flex h-16 items-center px-4 bg-white/5 backdrop-blur-lg">
        <Workflow className="h-8 w-8 text-blue-400" />
        <h1 className="text-xl font-bold ml-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Flowquix
        </h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'group flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-white/10 backdrop-blur-lg text-white'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              )
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="flex h-16 items-center px-4 border-t border-white/10">
        <button 
          onClick={() => navigate('/settings')}
          className="flex items-center text-gray-300 hover:text-white transition-colors duration-200"
        >
          <Settings className="mr-3 h-5 w-5" />
          Settings
        </button>
      </div>
    </div>
  );
}