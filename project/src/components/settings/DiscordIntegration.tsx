import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { MessageSquare, RefreshCw, Link, Unlink } from 'lucide-react';

interface DiscordToken {
  discord_id: string;
  access_token: string;
  expires_at: string;
}

export function DiscordIntegration() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<DiscordToken | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    fetchDiscordToken();
  }, []);

  async function fetchDiscordToken() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('discord_tokens')
        .select('discord_id, access_token, expires_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setToken(data);
    } catch (err) {
      console.error('Error fetching Discord token:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch Discord connection');
    } finally {
      setLoading(false);
    }
  }

  async function connectDiscord() {
    try {
      setConnecting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // In a real implementation, this would redirect to Discord OAuth
      // For demo purposes, we'll simulate a connection
      const mockToken: DiscordToken = {
        discord_id: '123456789',
        access_token: 'mock_token',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      const { error } = await supabase
        .from('discord_tokens')
        .upsert([{
          user_id: user.id,
          ...mockToken
        }]);

      if (error) throw error;
      setToken(mockToken);
    } catch (err) {
      console.error('Error connecting Discord:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect Discord');
    } finally {
      setConnecting(false);
    }
  }

  async function disconnectDiscord() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('discord_tokens')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setToken(null);
    } catch (err) {
      console.error('Error disconnecting Discord:', err);
      setError(err instanceof Error ? err.message : 'Failed to disconnect Discord');
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
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Discord Integration</h2>
      
      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-100 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">Discord Connection</span>
          </div>
          
          {token ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Connected as {token.discord_id}
              </span>
              <button
                onClick={disconnectDiscord}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Unlink className="h-4 w-4 mr-1" />
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connectDiscord}
              disabled={connecting}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {connecting ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Link className="h-4 w-4 mr-1" />
              )}
              Connect Discord
            </button>
          )}
        </div>

        {token && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Your Discord account is connected. You will receive notifications for:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>New messages in your channels</li>
              <li>Game invites from friends</li>
              <li>Team activity updates</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}