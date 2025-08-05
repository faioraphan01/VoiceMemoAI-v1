import React, { useState, useEffect } from 'react';
import { signOut, getCurrentUser } from '../services/supabase';
import { LogOut, User } from 'lucide-react';
import Recorder from './Recorder';
import NoteList from './NoteList';
import ThemeToggle from './ThemeToggle';

const Home = ({ user }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNoteCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-primary">VoiceMemoAI</h1>
        </div>
        <div className="flex-none gap-2">
          <div className="tooltip tooltip-bottom" data-tip="Toggle theme">
            <ThemeToggle />
          </div>
          
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              {user?.user_metadata?.avatar_url ? (
                <div className="w-8 rounded-full">
                  <img
                    alt="User avatar"
                    src={user.user_metadata.avatar_url}
                    className="rounded-full"
                  />
                </div>
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li className="menu-title">
                <span>{user?.user_metadata?.full_name || user?.email}</span>
              </li>
              <li>
                <button onClick={handleSignOut} className="text-error">
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Recording Section */}
          <div>
            <Recorder onNoteCreated={handleNoteCreated} />
          </div>
          
          {/* Notes List Section */}
          <div className="lg:col-span-1">
            <NoteList refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;