import React, { useState, useEffect } from 'react';
import { Trophy, Star, Award, Medal, Target, Users, CheckCircle2, Zap, Lightbulb, Clock, Heart, Briefcase, Laptop, MessageSquare, Code, Map, Coffee, Repeat, BarChart } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';

interface Achievement {
  id: string;
  type: 'task_completion' | 'project_milestone' | 'collaboration' | 'feedback' | 'consistency' | 'innovation' | 'efficiency' | 'learning' | 'communication';
  name: string;
  description: string;
  awarded_at: string;
  icon?: string;
  color?: string;
  progress?: number;
  maxProgress?: number;
  unlocked: boolean;
}

// Mock achievements data with various achievement types and creative names
const mockAchievements: Achievement[] = [
  {
    id: '1',
    type: 'task_completion',
    name: 'Task Master',
    description: 'Completed 10 tasks in record time',
    awarded_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    unlocked: true
  },
  {
    id: '2',
    type: 'project_milestone',
    name: 'Project Pioneer',
    description: 'Successfully launched your first project',
    awarded_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    unlocked: true
  },
  {
    id: '3',
    type: 'collaboration',
    name: 'Team Player',
    description: 'Collaborated with 5 different team members',
    awarded_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    unlocked: true
  },
  {
    id: '4',
    type: 'feedback',
    name: 'Feedback Virtuoso',
    description: 'Received 10 positive feedback comments from peers',
    awarded_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    unlocked: true
  },
  {
    id: '5',
    type: 'consistency',
    name: 'Streak Seeker',
    description: 'Logged in for 7 consecutive days',
    awarded_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    unlocked: true
  },
  {
    id: '6',
    type: 'innovation',
    name: 'Idea Innovator',
    description: 'Proposed a creative solution that was implemented',
    awarded_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    unlocked: true
  },
  {
    id: '7',
    type: 'efficiency',
    name: 'Productivity Prodigy',
    description: 'Completed all assigned tasks before the deadline for a week',
    awarded_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    unlocked: true
  },
  {
    id: '8',
    type: 'learning',
    name: 'Knowledge Seeker',
    description: 'Completed 3 training sessions',
    awarded_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    unlocked: true
  },
  {
    id: '9',
    type: 'communication',
    name: 'Communication Champion',
    description: 'Sent 50 messages in chat rooms',
    awarded_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    unlocked: true
  },
  {
    id: '10',
    type: 'task_completion',
    name: 'Bug Squasher',
    description: 'Fixed 5 critical bugs',
    awarded_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    unlocked: true
  },
  {
    id: '11',
    type: 'project_milestone',
    name: 'Deadline Destroyer',
    description: 'Completed a major project milestone ahead of schedule',
    awarded_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    unlocked: true
  },
  {
    id: '12',
    type: 'collaboration',
    name: 'Harmony Hero',
    description: 'Successfully resolved a team conflict',
    awarded_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    unlocked: true
  },
  {
    id: '13',
    type: 'innovation',
    name: 'Feature Visionary',
    description: 'Implemented a feature that delighted users',
    awarded_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    unlocked: true
  },
  {
    id: '14',
    type: 'efficiency',
    name: 'Code Optimizer',
    description: 'Improved application performance by 20%',
    awarded_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    unlocked: true
  },
  {
    id: '15',
    type: 'task_completion',
    name: 'To-Do Terminator',
    description: 'Cleared your entire task backlog',
    awarded_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    unlocked: true
  },
  // Locked achievements that can be earned
  {
    id: '16',
    type: 'learning',
    name: 'Code Maestro',
    description: 'Master a new programming language',
    awarded_at: '',
    progress: 75,
    maxProgress: 100,
    unlocked: false
  },
  {
    id: '17',
    type: 'consistency',
    name: 'Marathon Worker',
    description: 'Log 100 hours of work time',
    awarded_at: '',
    progress: 82,
    maxProgress: 100,
    unlocked: false
  },
  {
    id: '18',
    type: 'communication',
    name: 'Networking Ninja',
    description: 'Connect with 20 team members',
    awarded_at: '',
    progress: 14,
    maxProgress: 20,
    unlocked: false
  },
  {
    id: '19',
    type: 'project_milestone',
    name: 'Portfolio Perfectionist',
    description: 'Complete 10 projects',
    awarded_at: '',
    progress: 4,
    maxProgress: 10,
    unlocked: false
  },
  {
    id: '20',
    type: 'innovation',
    name: 'Trendsetter',
    description: 'Have 3 of your feature proposals adopted',
    awarded_at: '',
    progress: 2,
    maxProgress: 3,
    unlocked: false
  }
];

export function AchievementCenter() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchAchievements();
  }, []);

  async function fetchAchievements() {
    try {
      // Simulate API fetch delay
      setTimeout(() => {
        setAchievements(mockAchievements);
        setLoading(false);
      }, 800);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError('Failed to fetch achievements');
      setLoading(false);
    }
  }

  function getAchievementIcon(type: Achievement['type']) {
    switch (type) {
      case 'task_completion':
        return <CheckCircle2 className="h-8 w-8 text-green-500" />;
      case 'project_milestone':
        return <Target className="h-8 w-8 text-blue-500" />;
      case 'collaboration':
        return <Users className="h-8 w-8 text-purple-500" />;
      case 'feedback':
        return <Star className="h-8 w-8 text-yellow-500" />;
      case 'consistency':
        return <Repeat className="h-8 w-8 text-orange-500" />;
      case 'innovation':
        return <Lightbulb className="h-8 w-8 text-amber-500" />;
      case 'efficiency':
        return <Zap className="h-8 w-8 text-indigo-500" />;
      case 'learning':
        return <Laptop className="h-8 w-8 text-cyan-500" />;
      case 'communication':
        return <MessageSquare className="h-8 w-8 text-pink-500" />;
      default:
        return <Award className="h-8 w-8 text-gray-500" />;
    }
  }

  const filteredAchievements = filter === 'all' 
    ? achievements 
    : filter === 'unlocked' 
      ? achievements.filter(a => a.unlocked) 
      : achievements.filter(a => !a.unlocked);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

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
          <h1 className="text-2xl font-bold text-gray-900">Achievements</h1>
          <p className="mt-1 text-gray-500">Track your progress and celebrate milestones</p>
        </div>
        <div className="flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <span className="text-lg font-semibold">{unlockedCount} Earned</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}
        >
          All Achievements
        </button>
        <button
          onClick={() => setFilter('unlocked')}
          className={`px-4 py-2 rounded-lg ${filter === 'unlocked' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
        >
          Unlocked
        </button>
        <button
          onClick={() => setFilter('locked')}
          className={`px-4 py-2 rounded-lg ${filter === 'locked' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}
        >
          In Progress
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`bg-white rounded-lg shadow-md p-6 transform transition-all duration-200 ${achievement.unlocked ? 'hover:scale-105' : 'opacity-80'}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                {getAchievementIcon(achievement.type)}
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {achievement.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {achievement.description}
                  </p>
                </div>
              </div>
              {achievement.unlocked ? (
                <Medal className="h-5 w-5 text-yellow-500" />
              ) : (
                <Lock className="h-5 w-5 text-gray-400" />
              )}
            </div>
            
            {achievement.unlocked ? (
              <div className="mt-4 text-sm text-gray-500">
                Awarded {format(new Date(achievement.awarded_at), 'MMM d, yyyy')}
              </div>
            ) : (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{achievement.progress || 0}/{achievement.maxProgress || 100}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full" 
                    style={{ width: `${((achievement.progress || 0) / (achievement.maxProgress || 100)) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredAchievements.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No achievements in this category</h3>
            <p className="mt-2 text-gray-500">
              {filter === 'unlocked' 
                ? 'Complete tasks, reach milestones, and collaborate with your team to earn achievements' 
                : 'Keep working towards your goals to see in-progress achievements'}
            </p>
          </div>
        )}
      </div>

      {/* Achievement Stats */}
      <div className="mt-12 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Achievement Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="text-indigo-600 text-2xl font-bold">{unlockedCount}</div>
            <div className="text-gray-600">Earned achievements</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-green-600 text-2xl font-bold">{Math.round((unlockedCount / achievements.length) * 100)}%</div>
            <div className="text-gray-600">Completion rate</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-4">
            <div className="text-amber-600 text-2xl font-bold">{achievements.length - unlockedCount}</div>
            <div className="text-gray-600">Achievements to unlock</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-blue-600 text-2xl font-bold">{achievements.filter(a => a.type === 'project_milestone' && a.unlocked).length}</div>
            <div className="text-gray-600">Project milestones</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Lock icon component
function Lock({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );
}