import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import Login from './components/Login';
import Home from './components/Home';
import ThemeToggle from './components/ThemeToggle';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        {/* Theme Toggle - Available even during loading */}
        <div className="fixed top-4 right-4 z-50">
          <div className="tooltip tooltip-bottom" data-tip="Toggle theme">
            <ThemeToggle />
          </div>
        </div>
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return session ? <Home user={session.user} /> : <Login />;
}

export default App;