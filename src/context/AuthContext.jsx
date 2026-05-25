import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(false);

  // Safety net: force loading off after 20 seconds to cover retry backoff (3s+5s+8s + gaps)
  useEffect(() => {
    const id = setTimeout(() => {
      if (mounted.current) {
        console.warn('AuthProvider: forced loading=false after 20s timeout');
        setLoading(false);
      }
    }, 20000);
    return () => clearTimeout(id);
  }, []);

  // Retry helper — Chrome mobile throttles localStorage after refresh,
  // so a single getSession() often fails. Retry with backoff.
  const getSessionWithRetry = useCallback(async (maxRetries = 3) => {
    const timeouts = [3000, 5000, 8000]; // 3s, 5s, 8s
    let lastError = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Session check timeout (attempt ${attempt + 1})`)), timeouts[attempt])
        );

        const result = await Promise.race([sessionPromise, timeoutPromise]);
        return result; // success — return immediately
      } catch (err) {
        lastError = err;
        console.warn(`getSession attempt ${attempt + 1}/${maxRetries} failed:`, err.message);
        // Only wait between retries, not after the last one
        if (attempt < maxRetries - 1) {
          await new Promise(r => setTimeout(r, 500));
        }
      }
    }

    throw lastError || new Error('All getSession retries exhausted');
  }, []);

  const checkSession = useCallback(async () => {
    try {
      const { data, error } = await getSessionWithRetry();

      if (error) {
        console.error('Auth session error:', error);
        setIsAuthenticated(false);
        return;
      }

      if (!mounted.current) return;

      if (data?.session) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('email', data.session.user.email)
          .maybeSingle();

        setIsAuthenticated(roleData?.role === 'admin');
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Auth check error (all retries exhausted):', err);
      setIsAuthenticated(false);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [getSessionWithRetry]);

  useEffect(() => {
    mounted.current = true;
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (!mounted.current) return;

          if (session?.user) {
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('email', session.user.email)
              .maybeSingle();

            setIsAuthenticated(roleData?.role === 'admin');
          } else {
            setIsAuthenticated(false);
          }
        } catch (err) {
          console.error('Auth state change error:', err);
          setIsAuthenticated(false);
        } finally {
          if (mounted.current) setLoading(false);
        }
      }
    );

    return () => { mounted.current = false; subscription?.unsubscribe(); };
  }, [checkSession]);

  const login = useCallback(async (email, password) => {
    // Chrome mobile workaround: clear any stale session data before signing in.
    // After a refresh-triggered logout, Chrome's throttled localStorage can leave
    // corrupted session artifacts that block signInWithPassword. Explicit signOut
    // flushes the storage layer clean so the new login can write fresh data.
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (_) {
      // Ignore — signOut may fail if there's no session. That's fine.
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // Verify admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('email', data.user.email)
      .maybeSingle();

    if (roleData?.role !== 'admin') {
      // Not an admin — sign out immediately
      await supabase.auth.signOut();
      throw new Error('You are not authorized to access the admin panel.');
    }

    setIsAuthenticated(true);
    setLoading(false);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout, supabase }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Protected route wrapper
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Beautiful premium TEDx Red Loading Spinner */}
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid rgba(235, 0, 40, 0.1)',
          borderTopColor: '#EB0028',
          borderRadius: '50%',
          animation: 'tedx-spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes tedx-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
