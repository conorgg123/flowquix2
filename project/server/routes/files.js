import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Get all files for a user
router.get('/', async (req, res) => {
  try {
    const { data: files, error } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ message: 'Error fetching files' });
  }
});

// Upload file metadata
router.post('/', async (req, res) => {
  try {
    const { name, size, type, url } = req.body;
    
    const { data: file, error } = await supabase
      .from('files')
      .insert([
        {
          name,
          size,
          type,
          url,
          user_id: req.user.userId
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(file);
  } catch (error) {
    console.error('Error creating file record:', error);
    res.status(500).json({ message: 'Error creating file record' });
  }
});

// Delete file
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.userId);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Error deleting file' });
  }
});

export default router;