import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Get chat messages for a room
router.get('/room/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*, user:users(name)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Send a message
router.post('/room/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content } = req.body;
    
    const { data: message, error } = await supabase
      .from('messages')
      .insert([
        {
          content,
          room_id: roomId,
          user_id: req.user.userId
        }
      ])
      .select('*, user:users(name)')
      .single();

    if (error) throw error;
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

export default router;