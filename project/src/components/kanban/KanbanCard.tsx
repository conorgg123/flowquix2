import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Clock,
  Calendar,
  User,
  Tag,
  AlertTriangle,
  Brain
} from 'lucide-react';
import { format } from 'date-fns';

interface Card {
  id: string;
  title: string;
  description?: string;
  column_id: string;
  assigned_to?: string;
  due_date?: string;
  estimated_time?: string;
  actual_time?: string;
  start_date?: string;
  completion_date?: string;
  labels?: string[];
  priority: 'low' | 'medium' | 'high';
  progress: number;
  position: number;
  ai_suggestions?: {
    estimated_completion?: string;
    similar_cards_count?: number;
    recommended_column?: string;
    confidence: 'low' | 'medium' | 'high';
  };
}

interface Props {
  card: Card;
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

export function KanbanCard({ card }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: card.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const isOverdue = card.due_date && new Date(card.due_date) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg shadow p-4 cursor-move hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900">{card.title}</h4>
        {card.ai_suggestions && (
          <div
            className="text-indigo-600"
            title="AI suggestions available"
          >
            <Brain className="h-4 w-4" />
          </div>
        )}
      </div>

      {card.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {card.description}
        </p>
      )}

      <div className="space-y-2">
        {/* Progress Bar */}
        <div className="h-1.5 bg-gray-100 rounded-full">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${card.progress}%` }}
          />
        </div>

        {/* Due Date */}
        {card.due_date && (
          <div className="flex items-center text-sm">
            <Calendar className={`h-4 w-4 mr-1.5 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`} />
            <span className={isOverdue ? 'text-red-600' : 'text-gray-600'}>
              {format(new Date(card.due_date), 'MMM d, yyyy')}
            </span>
          </div>
        )}

        {/* Time Estimates */}
        {(card.estimated_time || card.actual_time) && (
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-1.5 text-gray-400" />
            <span>
              {card.actual_time
                ? `${card.actual_time} / ${card.estimated_time || '?'}`
                : `Est. ${card.estimated_time}`}
            </span>
          </div>
        )}

        {/* Assignee */}
        {card.assigned_to && (
          <div className="flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-1.5 text-gray-400" />
            <span>{card.assigned_to}</span>
          </div>
        )}
      </div>

      {/* Labels */}
      {card.labels && card.labels.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {card.labels.map(label => (
            <span
              key={label}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
            >
              <Tag className="h-3 w-3 mr-1" />
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Priority */}
      <div className="mt-3 flex items-center justify-between">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            priorityColors[card.priority]
          }`}
        >
          {card.priority}
        </span>

        {isOverdue && (
          <span className="text-red-500" title="Overdue">
            <AlertTriangle className="h-4 w-4" />
          </span>
        )}
      </div>
    </div>
  );
}