import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(false);

  const checkSession = useCallback(async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Auth session error:', error);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    if (!mounted.current) return;

    if (data?.session) {
      // Check user_roles for admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('email', data.session.user.email)
        .maybeSingle();

      setIsAuthenticated(roleData?.role === 'admin');
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    mounted.current = true;
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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
        setLoading(false);
      }
    );

    return () => { mounted.current = false; subscription?.unsubscribe(); };
  }, [checkSession]);

  const login = useCallback(async (email, password) => {
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

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a'
      }} />
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, supabase }}>
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
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
