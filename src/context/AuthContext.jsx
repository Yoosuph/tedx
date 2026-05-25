import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(false);
  // Track whether onAuthStateChange has already resolved the initial state
  const initialResolved = useRef(false);

  // ---------- helper: check role ----------
  const checkAdminRole = useCallback(async (email) => {
    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('email', email)
        .maybeSingle();
      return roleData?.role === 'admin';
    } catch (err) {
      console.error('Role check failed:', err);
      return false;
    }
  }, []);

  // ---------- helper: Supabase storage key ----------
  const getSupabaseStorageKey = useCallback(() => {
    try {
      const url = import.meta.env.VITE_SUPABASE_URL || '';
      const matches = url.match(/https:\/\/([^.]+)\.supabase/);
      if (matches && matches[1]) {
        return `sb-${matches[1]}-auth-token`;
      }
    } catch (e) {
      console.error('Error deriving storage key:', e);
    }
    return null;
  }, []);

  // ---------- helper: has a stored session in localStorage ----------
  const hasStoredSession = useCallback(() => {
    const key = getSupabaseStorageKey();
    if (!key) return false;
    try {
      const val = localStorage.getItem(key);
      if (!val) return false;
      const parsed = JSON.parse(val);
      // Supabase v2 stores { user, access_token, ... } at the root level
      return !!(parsed && (parsed.user || (parsed.currentSession && parsed.currentSession.user)));
    } catch {
      return false;
    }
  }, [getSupabaseStorageKey]);

  // ---------- helper: clear the stored session ----------
  const clearStoredSession = useCallback(() => {
    const key = getSupabaseStorageKey();
    if (key) {
      try {
        localStorage.removeItem(key);
      } catch { /* ignore */ }
    }
  }, [getSupabaseStorageKey]);

  // ---------- Main auth bootstrap ----------
  useEffect(() => {
    mounted.current = true;

    // ─── Safety valve: force loading off after 12 seconds ───
    // This ensures the spinner never hangs forever.
    const safetyTimer = setTimeout(() => {
      if (mounted.current && loading) {
        console.warn('AuthProvider: forced loading=false after 12s safety timeout');
        // If loading is STILL true, either the session check or onAuthStateChange
        // never resolved.  Fall back to localStorage.
        if (hasStoredSession()) {
          console.log('AuthProvider: safety timeout — using localStorage fallback');
          setIsAuthenticated(true);
        }
        setLoading(false);
      }
    }, 12000);

    // ─── onAuthStateChange listener ───
    // This fires IMMEDIATELY with the current session state when first
    // registered (Supabase SDK calls the callback with INITIAL_SESSION).
    // This is much more reliable than calling getSession() manually because
    // the SDK handles all the internal token refresh, lock acquisition, and
    // localStorage parsing itself.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted.current) return;

        console.log(`🔑 Auth event: ${event}`, session?.user?.email ?? '(no user)');

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            const isAdmin = await checkAdminRole(session.user.email);
            if (mounted.current) {
              setIsAuthenticated(isAdmin);
              setLoading(false);
              initialResolved.current = true;
            }
          } else {
            // INITIAL_SESSION with no session — user is not logged in
            if (mounted.current) {
              // On Chrome mobile, INITIAL_SESSION can fire with null even though
              // the token exists in localStorage (because the SDK hasn't finished
              // restoring it yet). Only clear auth for INITIAL_SESSION if there's
              // genuinely no stored token.
              if (event === 'INITIAL_SESSION' && hasStoredSession()) {
                console.log('Auth: INITIAL_SESSION was null but localStorage has a token — waiting for TOKEN_REFRESHED');
                // Don't change isAuthenticated yet; give the SDK time to refresh.
                // The safety timer above will resolve it if nothing else fires.
                setIsAuthenticated(true); // Optimistic — localStorage says we're logged in
                setLoading(false);
                initialResolved.current = true;
              } else {
                setIsAuthenticated(false);
                setLoading(false);
                initialResolved.current = true;
              }
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted.current) {
            setIsAuthenticated(false);
            setLoading(false);
            initialResolved.current = true;
          }
        }
      }
    );

    // ─── Fallback: if INITIAL_SESSION never fires within 5 seconds, fall back ───
    const initialFallback = setTimeout(() => {
      if (mounted.current && !initialResolved.current) {
        console.warn('AuthProvider: INITIAL_SESSION never fired, using localStorage fallback');
        if (hasStoredSession()) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
        setLoading(false);
        initialResolved.current = true;
      }
    }, 5000);

    return () => {
      mounted.current = false;
      clearTimeout(safetyTimer);
      clearTimeout(initialFallback);
      subscription?.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- Login ----------
  const login = useCallback(async (email, password) => {
    // Chrome mobile workaround: clear stale session data before signing in.
    // After a refresh-triggered logout, stale session artifacts in localStorage
    // can block signInWithPassword. We do a local signOut to flush them.
    // Wrap in a try-catch with a short timeout so it doesn't hang forever.
    try {
      await Promise.race([
        supabase.auth.signOut({ scope: 'local' }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('signOut timeout')), 3000)),
      ]);
    } catch (e) {
      // If signOut hangs or there's no session, just clear localStorage manually
      console.warn('Pre-login signOut failed/timed-out, clearing storage manually:', e.message);
      clearStoredSession();
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // Verify admin role
    const isAdmin = await checkAdminRole(data.user.email);

    if (!isAdmin) {
      await supabase.auth.signOut();
      throw new Error('You are not authorized to access the admin panel.');
    }

    setIsAuthenticated(true);
    setLoading(false);
    return data.user;
  }, [checkAdminRole, clearStoredSession]);

  // ---------- Logout ----------
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // If signOut fails, clear storage manually
      clearStoredSession();
    }
    setIsAuthenticated(false);
  }, [clearStoredSession]);

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
