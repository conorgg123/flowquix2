import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Send, Edit2, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  user: {
    name: string;
  };
}

interface TaskCommentsProps {
  taskId: string;
  onClose: () => void;
}

export function TaskComments({ taskId, onClose }: TaskCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  async function fetchComments() {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .select(`
          *,
          user:user_id (
            name
          )
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      setError('Failed to fetch comments');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function addComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const { data, error } = await supabase
        .from('task_comments')
        .insert([
          {
            task_id: taskId,
            content: newComment.trim()
          }
        ])
        .select(`
          *,
          user:user_id (
            name
          )
        `)
        .single();

      if (error) throw error;
      setComments([...comments, data]);
      setNewComment('');

      // Record activity
      await supabase
        .from('task_activity')
        .insert([
          {
            task_id: taskId,
            action: 'comment_added',
            details: { content: newComment.trim() }
          }
        ]);
    } catch (err) {
      setError('Failed to add comment');
      console.error('Error:', err);
    }
  }

  async function updateComment(id: string) {
    if (!editContent.trim()) return;

    try {
      const { data, error } = await supabase
        .from('task_comments')
        .update({ content: editContent.trim() })
        .eq('id', id)
        .select(`
          *,
          user:user_id (
            name
          )
        `)
        .single();

      if (error) throw error;
      setComments(comments.map(c => c.id === id ? data : c));
      setEditingComment(null);
      setEditContent('');

      // Record activity
      await supabase
        .from('task_activity')
        .insert([
          {
            task_id: taskId,
            action: 'comment_updated',
            details: { comment_id: id }
          }
        ]);
    } catch (err) {
      setError('Failed to update comment');
      console.error('Error:', err);
    }
  }

  async function deleteComment(id: string) {
    try {
      const { error } = await supabase
        .from('task_comments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setComments(comments.filter(c => c.id !== id));

      // Record activity
      await supabase
        .from('task_activity')
        .insert([
          {
            task_id: taskId,
            action: 'comment_deleted',
            details: { comment_id: id }
          }
        ]);
    } catch (err) {
      setError('Failed to delete comment');
      console.error('Error:', err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Comments</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-700 font-medium">
                      {comment.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{comment.user.name}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingComment(comment.id);
                      setEditContent(comment.content);
                    }}
                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {editingComment === comment.id ? (
                <div className="mt-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                  />
                  <div className="mt-2 flex justify-end space-x-2">
                    <button
                      onClick={() => setEditingComment(null)}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => updateComment(comment.id)}
                      className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-gray-700">{comment.content}</p>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={addComment} className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}