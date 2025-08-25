import { supabase } from './supabase';

interface KanbanColumn {
  id: string;
  name: string;
  color?: string;
  wip_limit?: number;
  is_default: boolean;
  position: number;
}

interface KanbanCard {
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

interface CardActivity {
  id: string;
  card_id: string;
  from_column_id?: string;
  to_column_id?: string;
  user_id: string;
  action: string;
  details: Record<string, any>;
  created_at: string;
}

export async function createCustomColumn(
  boardId: string,
  name: string,
  color?: string,
  wipLimit?: number,
  isDefault = false
): Promise<KanbanColumn> {
  try {
    const { data, error } = await supabase
      .from('kanban_columns')
      .insert([{
        board_id: boardId,
        name,
        color,
        wip_limit: wipLimit,
        is_default: isDefault,
        position: 0 // Will be updated after insert
      }])
      .select()
      .single();

    if (error) throw error;

    // Update positions of all columns
    const { data: columns } = await supabase
      .from('kanban_columns')
      .select('id')
      .eq('board_id', boardId)
      .order('position');

    if (columns) {
      const updates = columns.map((col, index) => ({
        id: col.id,
        position: index
      }));

      const { error: updateError } = await supabase
        .from('kanban_columns')
        .upsert(updates);

      if (updateError) throw updateError;
    }

    return data;
  } catch (err) {
    console.error('Error creating custom column:', err);
    throw err;
  }
}

export async function updateCardProgress(
  cardId: string,
  progress: number
): Promise<void> {
  try {
    const { error } = await supabase
      .from('kanban_cards')
      .update({ progress })
      .eq('id', cardId);

    if (error) throw error;
  } catch (err) {
    console.error('Error updating card progress:', err);
    throw err;
  }
}

export async function getColumnProgress(columnId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .rpc('calculate_column_progress', {
        p_column_id: columnId
      });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error calculating column progress:', err);
    throw err;
  }
}

export async function getCardActivity(cardId: string): Promise<CardActivity[]> {
  try {
    const { data, error } = await supabase
      .from('kanban_card_activity')
      .select(`
        *,
        user:user_id(email)
      `)
      .eq('card_id', cardId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching card activity:', err);
    throw err;
  }
}

export async function generateAISuggestions(cardId: string): Promise<void> {
  try {
    const { data, error } = await supabase
      .rpc('generate_card_suggestions', {
        p_card_id: cardId
      });

    if (error) throw error;

    // Update card with suggestions
    const { error: updateError } = await supabase
      .from('kanban_cards')
      .update({ ai_suggestions: data })
      .eq('id', cardId);

    if (updateError) throw updateError;
  } catch (err) {
    console.error('Error generating AI suggestions:', err);
    throw err;
  }
}

export async function moveCard(
  cardId: string,
  toColumnId: string,
  position: number
): Promise<void> {
  try {
    const { error } = await supabase
      .from('kanban_cards')
      .update({
        column_id: toColumnId,
        position
      })
      .eq('id', cardId);

    if (error) {
      if (error.message.includes('WIP limit reached')) {
        throw new Error('Cannot move card: WIP limit reached for this column');
      }
      throw error;
    }
  } catch (err) {
    console.error('Error moving card:', err);
    throw err;
  }
}