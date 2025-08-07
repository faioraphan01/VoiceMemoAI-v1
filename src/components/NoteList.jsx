import React, { useState, useEffect } from 'react';
import { getNotes, deleteNote } from '../services/supabase';
import { Trash2, Calendar, Zap, Copy } from 'lucide-react';

const NoteList = ({ refreshTrigger }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadNotes();
  }, [refreshTrigger]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const { data, error } = await getNotes();
      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const { error } = await deleteNote(id);
      if (error) throw error;
      setNotes(notes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Error deleting note. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

 const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('th-TH', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};


  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body text-center">
          <div className="bg-base-200 p-6 rounded-full w-fit mx-auto mb-4">
            <Zap className="w-12 h-12 text-base-content/50" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No voice memos yet</h3>
          <p className="text-base-content/70">
            Start recording your first voice memo to see it appear here.
          </p>
        </div>
      </div>
    );
  }

 return (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-base-content mb-4">Your Voice Memos</h2>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => (
        <div
          key={note.id}
          className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
        >
          <div className="card-body">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2 text-sm text-base-content/70">
                <Calendar className="w-4 h-4" />
                {formatDate(note.created_at)}
              </div>
              <button
                onClick={() => handleDelete(note.id)}
                className="btn btn-ghost btn-sm btn-circle text-error hover:bg-error/20"
                disabled={deletingId === note.id}
              >
                {deletingId === note.id ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-accent">AI Summary</span>
                </div>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => handleCopy(note.summary, note.id)}
                  title="Copy"
                >
                  {copiedId === note.id ? (
                    <span className="text-success text-xs font-semibold animate-pulse">Copied!</span>
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="bg-base-200 p-3 rounded-lg max-h-48 overflow-y-auto">
                <div className="text-base-content/80 whitespace-pre-wrap break-words">
                  {note.summary}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

};

export default NoteList;

