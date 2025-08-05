import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth functions
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = () => {
  return supabase.auth.getUser();
};

// Notes functions
export const createNote = async (transcript, summary, audioUrl = '') => {
  const { data: user } = await getCurrentUser();
  if (!user.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('notes')
    .insert([
      {
        user_id: user.user.id,
        transcript,
        summary,
        audio_url: audioUrl
      }
    ])
    .select();

  return { data, error };
};

export const getNotes = async () => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });

  return { data, error };
};

export const deleteNote = async (id) => {
  const { data, error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  return { data, error };
};

export const updateNote = async (id, updates) => {
  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', id)
    .select();

  return { data, error };
};