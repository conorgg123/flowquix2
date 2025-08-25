import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import { AlertTriangle } from 'lucide-react';

interface Column {
  id: string;
  name: string;
  color?: string;
  wip_limit?: number;
  is_default: boolean;
  position: number;
}

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
  column: Column;
  cards: Card[];
}

export function KanbanColumn({ column, cards }: Props) {
  const { setNodeRef } = useDroppable({
    id: column.id
  });

  const progress = cards.length > 0
    ? (cards.filter(card => card.progress === 100).length / cards.length) * 100
    : 0;

  const isOverWipLimit = column.wip_limit !== undefined && cards.length >= column.wip_limit;

  return (
    <div
      ref={setNodeRef}
      className="flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4"
      style={{
        borderTop: `4px solid ${column.color || '#6366F1'}`
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-medium text-gray-900">{column.name}</h3>
          <p className="text-sm text-gray-500">
            {cards.length} {cards.length === 1 ? 'card' : 'cards'}
            {column.wip_limit && ` / ${column.wip_limit}`}
          </p>
        </div>
        {isOverWipLimit && (
          <div className="text-yellow-600" title="WIP limit reached">
            <AlertTriangle className="h-5 w-5" />
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-gray-200 rounded-full mb-4">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <SortableContext
        items={cards.map(card => card.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {cards.map(card => (
            <KanbanCard key={card.id} card={card} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}