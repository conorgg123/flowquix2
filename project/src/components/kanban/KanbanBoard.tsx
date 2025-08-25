import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  KeyboardSensor,
  PointerSensor,
  closestCorners
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import {
  Plus,
  Settings,
  Filter,
  BarChart2,
  Calendar,
  User,
  Tag,
  AlertTriangle,
  X,
  Clock,
  Brain
} from 'lucide-react';
import { format } from 'date-fns';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { createCustomColumn, moveCard, generateAISuggestions } from '../../lib/kanbanUtils';
import { supabase } from '../../lib/supabase';

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

interface Filter {
  assignee?: string;
  priority?: string;
  labels?: string[];
  dueDate?: 'today' | 'week' | 'month' | 'overdue';
}

export function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [showNewColumn, setShowNewColumn] = useState(false);
  const [newColumn, setNewColumn] = useState({
    name: '',
    color: '#6366F1',
    wip_limit: undefined as number | undefined
  });
  const [filters, setFilters] = useState<Filter>({});
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchBoardData();
  }, []);

  async function fetchBoardData() {
    try {
      // Fetch columns
      const { data: columnsData, error: columnsError } = await supabase
        .from('kanban_columns')
        .select('*')
        .order('position');

      if (columnsError) throw columnsError;

      // Fetch cards
      const { data: cardsData, error: cardsError } = await supabase
        .from('kanban_cards')
        .select(`
          *,
          assigned_user:assigned_to(email)
        `)
        .order('position');

      if (cardsError) throw cardsError;

      setColumns(columnsData || []);
      setCards(cardsData || []);
    } catch (err) {
      console.error('Error fetching board data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load board data');
    } finally {
      setLoading(false);
    }
  }

  async function handleDragEnd(event: any) {
    const { active, over } = event;
    
    if (!over) return;

    const activeCard = cards.find(card => card.id === active.id);
    const overColumn = columns.find(col => col.id === over.id);

    if (!activeCard || !overColumn) return;

    try {
      await moveCard(activeCard.id, overColumn.id, 0);
      
      setCards(cards.map(card =>
        card.id === activeCard.id
          ? { ...card, column_id: overColumn.id }
          : card
      ));

      // Generate AI suggestions for the moved card
      await generateAISuggestions(activeCard.id);
      await fetchBoardData(); // Refresh to get updated suggestions
    } catch (err) {
      console.error('Error moving card:', err);
      setError(err instanceof Error ? err.message : 'Failed to move card');
    }
  }

  async function handleCreateColumn(e: React.FormEvent) {
    e.preventDefault();
    if (!newColumn.name.trim()) return;

    try {
      const column = await createCustomColumn(
        'board_id', // You'll need to pass the actual board ID
        newColumn.name,
        newColumn.color,
        newColumn.wip_limit
      );

      setColumns([...columns, column]);
      setShowNewColumn(false);
      setNewColumn({
        name: '',
        color: '#6366F1',
        wip_limit: undefined
      });
    } catch (err) {
      console.error('Error creating column:', err);
      setError(err instanceof Error ? err.message : 'Failed to create column');
    }
  }

  function filterCards(card: Card): boolean {
    if (filters.assignee && card.assigned_to !== filters.assignee) return false;
    if (filters.priority && card.priority !== filters.priority) return false;
    if (filters.labels?.length && !filters.labels.some(label => card.labels?.includes(label))) return false;
    
    if (filters.dueDate && card.due_date) {
      const dueDate = new Date(card.due_date);
      const today = new Date();
      
      switch (filters.dueDate) {
        case 'today':
          if (format(dueDate, 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd')) return false;
          break;
        case 'week':
          const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          if (dueDate > weekFromNow) return false;
          break;
        case 'month':
          const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
          if (dueDate > monthFromNow) return false;
          break;
        case 'overdue':
          if (dueDate > today) return false;
          break;
      }
    }

    return true;
  }

  const filteredCards = cards.filter(filterCards);

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
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
          <button
            onClick={() => setShowNewColumn(true)}
            className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Column
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(true)}
            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </button>
          <button
            onClick={() => setShowAISuggestions(true)}
            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Brain className="h-4 w-4 mr-1" />
            AI Insights
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={(event) => {
          const card = cards.find(c => c.id === event.active.id);
          setActiveCard(card || null);
        }}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-6 overflow-x-auto pb-6">
          {columns.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              cards={filteredCards.filter(card => card.column_id === column.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard && <KanbanCard card={activeCard} />}
        </DragOverlay>
      </DndContext>

      {/* New Column Dialog */}
      {showNewColumn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create New Column</h2>
              <button
                onClick={() => setShowNewColumn(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateColumn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Column Name
                </label>
                <input
                  type="text"
                  value={newColumn.name}
                  onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Color
                </label>
                <input
                  type="color"
                  value={newColumn.color}
                  onChange={(e) => setNewColumn({ ...newColumn, color: e.target.value })}
                  className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  WIP Limit (optional)
                </label>
                <input
                  type="number"
                  value={newColumn.wip_limit || ''}
                  onChange={(e) => setNewColumn({ ...newColumn, wip_limit: parseInt(e.target.value) || undefined })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  min="1"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewColumn(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create Column
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters Dialog */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Filter Cards</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Assignee
                </label>
                <select
                  value={filters.assignee || ''}
                  onChange={(e) => setFilters({ ...filters, assignee: e.target.value || undefined })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Any</option>
                  {/* Add assignee options */}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  value={filters.priority || ''}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value || undefined })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Any</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <select
                  value={filters.dueDate || ''}
                  onChange={(e) => setFilters({ ...filters, dueDate: e.target.value as any || undefined })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Any</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setFilters({});
                    setShowFilters(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Suggestions Dialog */}
      {showAISuggestions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">AI Insights</h2>
              <button
                onClick={() => setShowAISuggestions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {cards.filter(card => card.ai_suggestions).map(card => (
                <div key={card.id} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{card.title}</h3>
                  <div className="space-y-2">
                    {card.ai_suggestions?.estimated_completion && (
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <span>Estimated completion: {format(new Date(card.ai_suggestions.estimated_completion), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                    {card.ai_suggestions?.recommended_column && (
                      <div className="flex items-center text-sm">
                        <BarChart2 className="h-4 w-4 text-gray-400 mr-2" />
                        <span>Recommended column: {card.ai_suggestions.recommended_column}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm">
                      <Brain className="h-4 w-4 text-gray-400 mr-2" />
                      <span>Confidence: {card.ai_suggestions.confidence}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowAISuggestions(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}