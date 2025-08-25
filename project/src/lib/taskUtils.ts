import { RRule } from 'rrule';
import { supabase } from './supabase';

interface TaskDependency {
  id: string;
  task_id: string;
  depends_on_task_id: string;
}

interface RecurringTask {
  id: string;
  task_id: string;
  pattern: string;
  next_occurrence: string;
}

export async function createTaskDependency(taskId: string, dependsOnTaskId: string) {
  try {
    const { data, error } = await supabase
      .from('task_dependencies')
      .insert([{
        task_id: taskId,
        depends_on_task_id: dependsOnTaskId
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error creating task dependency:', err);
    throw err;
  }
}

export async function getTaskDependencies(taskId: string) {
  try {
    const { data, error } = await supabase
      .from('task_dependencies')
      .select(`
        *,
        depends_on:depends_on_task_id (
          id,
          title,
          status
        )
      `)
      .eq('task_id', taskId);

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching task dependencies:', err);
    throw err;
  }
}

export async function createRecurringTask(
  taskId: string,
  pattern: string,
  startDate: Date
) {
  try {
    // Validate RRule pattern
    const rule = RRule.fromString(pattern);
    const nextOccurrence = rule.after(startDate);

    if (!nextOccurrence) {
      throw new Error('Invalid recurrence pattern');
    }

    const { data, error } = await supabase
      .from('task_recurrence')
      .insert([{
        task_id: taskId,
        pattern,
        next_occurrence: nextOccurrence.toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error creating recurring task:', err);
    throw err;
  }
}

export async function updateRecurringTask(
  taskId: string,
  pattern: string,
  startDate: Date
) {
  try {
    const rule = RRule.fromString(pattern);
    const nextOccurrence = rule.after(startDate);

    if (!nextOccurrence) {
      throw new Error('Invalid recurrence pattern');
    }

    const { data, error } = await supabase
      .from('task_recurrence')
      .update({
        pattern,
        next_occurrence: nextOccurrence.toISOString()
      })
      .eq('task_id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating recurring task:', err);
    throw err;
  }
}

export async function getTaskPrioritySuggestion(taskId: string) {
  try {
    const { data, error } = await supabase
      .from('task_priorities')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (err) {
    console.error('Error fetching task priority suggestion:', err);
    throw err;
  }
}

// Web Speech API for voice input
export function startVoiceRecognition(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!('webkitSpeechRecognition' in window)) {
      reject(new Error('Voice recognition not supported'));
      return;
    }

    // @ts-ignore - WebkitSpeechRecognition is not in TypeScript types
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalTranscript = '';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
    };

    recognition.onerror = (event: any) => {
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.onend = () => {
      resolve(finalTranscript);
    };

    recognition.start();
  });
}