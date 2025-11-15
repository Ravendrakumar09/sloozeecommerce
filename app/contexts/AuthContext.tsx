'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'manager' | 'storekeeper';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (userData: User, sessionData: Session) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isLoggingOutRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let sessionCheckTimedOut = false;
    
    // Check for existing session on mount
    const checkSession = async () => {
      // Don't check session if we're in the middle of logging out
      // Check both ref and sessionStorage to persist across page navigation
      // But only skip if the flag was set recently (within last 5 seconds)
      const logoutFlag = sessionStorage.getItem('isLoggingOut');
      const logoutTimestamp = sessionStorage.getItem('isLoggingOutTimestamp');
      const isLoggingOut = isLoggingOutRef.current || 
        (logoutFlag === 'true' && logoutTimestamp && (Date.now() - parseInt(logoutTimestamp)) < 5000);
      
      if (isLoggingOut) {
        console.log('Skipping session check - logout in progress');
        if (isMounted) {
          setLoading(false);
        }
        return;
      }
      
      // Clean up old logout flags
      if (logoutFlag === 'true' && logoutTimestamp && (Date.now() - parseInt(logoutTimestamp)) >= 5000) {
        try {
          sessionStorage.removeItem('isLoggingOut');
          sessionStorage.removeItem('isLoggingOutTimestamp');
        } catch (err) {
          console.error('Error cleaning up logout flag:', err);
        }
      }
      // Check if Supabase is configured first
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://placeholder.supabase.co') {
        console.warn('Supabase not configured. Checking localStorage for session...');
        // Fallback to localStorage if Supabase not configured
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            console.log('Restored user from localStorage:', userData);
          }
        } catch (err) {
          console.error('Error reading from localStorage:', err);
        }
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const supabase = createClient();
        console.log('Checking for existing session...');
        
        // Use a timeout wrapper to prevent hanging
        let sessionResult: { data: { session: Session | null }, error: any } | null = null;
        
        const timeoutId = setTimeout(() => {
          if (!sessionCheckTimedOut && isMounted) {
            sessionCheckTimedOut = true;
            console.warn('Session check taking too long, continuing without session...');
            // Force loading to false immediately
            setLoading(false);
            // Also try to restore from localStorage as fallback
            try {
              const storedUser = localStorage.getItem('user');
              if (storedUser) {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                console.log('Restored user from localStorage after timeout:', userData);
              }
            } catch (err) {
              console.error('Error reading from localStorage:', err);
            }
          }
        }, 2000); // 2 second timeout
        
        try {
          sessionResult = await supabase.auth.getSession();
          clearTimeout(timeoutId);
        } catch (err) {
          clearTimeout(timeoutId);
          console.error('Error in getSession:', err);
        }
        
        // Check timeout first before processing
        if (sessionCheckTimedOut) {
          console.log('Session check timed out, skipping session processing');
          return;
        }
        
        if (!isMounted) {
          console.log('Component unmounted, skipping session processing');
          return;
        }
        
        if (!sessionResult) {
          console.warn('No session result, continuing without session');
          if (isMounted) {
            setLoading(false);
          }
          return;
        }
        
        const { data: { session: currentSession }, error: sessionError } = sessionResult;
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          if (isMounted) {
            setLoading(false);
          }
          return;
        }
        
        if (currentSession?.user) {
          console.log('Session found, fetching user role...');
          
          let userRole: UserRole = 'storekeeper';
          let userName = currentSession.user.user_metadata?.name || currentSession.user.email?.split('@')[0] || 'User';
          
          try {
            // Get role from database (authoritative source) with timeout
            const rolePromise = supabase
              .from('user_roles')
              .select('role, name')
              .eq('id', currentSession.user.id)
              .single();
            
            const roleTimeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Role fetch timeout')), 2000)
            );
            
            try {
              const { data: userRoleData, error: roleError } = await Promise.race([
                rolePromise,
                roleTimeoutPromise
              ]) as { data: any, error: any };

              if (!roleError && userRoleData) {
                userRole = userRoleData.role || 'storekeeper';
                userName = userRoleData.name || userName;
                console.log('Role fetched from database:', userRole);
              } else {
                console.warn('Role fetch error or no data, using defaults:', roleError);
              }
            } catch (raceError) {
              console.warn('Role fetch timed out or failed, using defaults');
            }
          } catch (roleError) {
            console.warn('Error in role fetch, using defaults:', roleError);
          }

          if (!isMounted) return;

          const userData: User = {
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            role: userRole,
            name: userName,
          };
          
          console.log('User authenticated:', userData);
          if (isMounted && !sessionCheckTimedOut) {
            setUser(userData);
            setSession(currentSession);
            setLoading(false);
          }
        } else {
          console.log('No session found');
          if (isMounted && !sessionCheckTimedOut) {
            setLoading(false);
          }
        }
      } catch (error: any) {
        console.error('Error checking session:', error);
        if (isMounted && !sessionCheckTimedOut) {
          setLoading(false);
        }
      } finally {
        // Always ensure loading is set to false (unless timeout already handled it)
        if (isMounted && !sessionCheckTimedOut) {
          console.log('Setting loading to false in finally block');
          setLoading(false);
        } else if (sessionCheckTimedOut) {
          console.log('Loading already set to false by timeout handler');
        }
      }
    };

    checkSession();

    // Listen for auth changes (only if Supabase is configured)
    // Note: We set this up after checkSession to avoid interference
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    let subscription: { unsubscribe: () => void } | null = null;
    let listenerTimeoutId: NodeJS.Timeout | null = null;
    
    // Only set up auth state listener if Supabase is configured and session check didn't timeout
    if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://placeholder.supabase.co') {
      // Delay setting up listener to avoid interference with initial session check
      listenerTimeoutId = setTimeout(() => {
        if (!isMounted || sessionCheckTimedOut) {
          return;
        }
        
        try {
          const supabase = createClient();
          const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
            // Check both ref and sessionStorage to persist across page navigation
            // But only skip if the flag was set recently (within last 5 seconds)
            const logoutFlag = sessionStorage.getItem('isLoggingOut');
            const logoutTimestamp = sessionStorage.getItem('isLoggingOutTimestamp');
            const isLoggingOut = isLoggingOutRef.current || 
              (logoutFlag === 'true' && logoutTimestamp && (Date.now() - parseInt(logoutTimestamp)) < 5000);
            
            if (!isMounted || sessionCheckTimedOut || isLoggingOut) {
              console.log('Skipping auth state change - logout in progress or component unmounted', { event, hasSession: !!session });
              // If we have a session but are logging out, ignore it
              if (session && isLoggingOut) {
                console.log('Ignoring session restoration during logout');
                return;
              }
              return;
            }
            
            console.log('Auth state changed:', event, session ? 'session exists' : 'no session');
          
          if (session?.user) {
            try {
              // Get role from database (authoritative source)
              const { data: userRoleData } = await supabase
                .from('user_roles')
                .select('role, name')
                .eq('id', session.user.id)
                .single();

              // Default to 'storekeeper' if no role found in database
              const userRole = userRoleData?.role || 'storekeeper';
              const userName = userRoleData?.name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User';
              
              const userData: User = {
                id: session.user.id,
                email: session.user.email || '',
                role: userRole,
                name: userName,
              };
              
              setUser(userData);
              setSession(session);
            } catch (err) {
              console.error('Error in auth state change handler:', err);
              // Still set user with defaults
              const userData: User = {
                id: session.user.id,
                email: session.user.email || '',
                role: 'storekeeper',
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              };
              setUser(userData);
              setSession(session);
            }
          } else {
            // User signed out or session expired
            setUser(null);
            setSession(null);
          }
          if (isMounted && !sessionCheckTimedOut) {
            setLoading(false);
          }
          });
          subscription = data.subscription;
        } catch (err) {
          console.error('Error setting up auth state listener:', err);
          if (isMounted && !sessionCheckTimedOut) {
            setLoading(false);
          }
        }
      }, 100); // Small delay to let session check complete first
    } else {
      // If Supabase not configured, just set loading to false
      if (isMounted) {
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
      if (listenerTimeoutId) {
        clearTimeout(listenerTimeoutId);
      }
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const login = (userData: User, sessionData: Session) => {
    setUser(userData);
    setSession(sessionData);
    // Session is stored securely by Supabase in cookies
  };

  const logout = async () => {
    console.log('Logout function called');
    
    // Set flag to prevent session restoration (both ref and sessionStorage)
    isLoggingOutRef.current = true;
    try {
      sessionStorage.setItem('isLoggingOut', 'true');
      sessionStorage.setItem('isLoggingOutTimestamp', Date.now().toString());
    } catch (err) {
      console.error('Error setting sessionStorage:', err);
    }
    
    try {
      // Clear local state first
      console.log('Clearing local state...');
      setUser(null);
      setSession(null);
      
      // Clear localStorage
      try {
        localStorage.removeItem('user');
        localStorage.removeItem('session');
        console.log('Cleared localStorage');
      } catch (err) {
        console.error('Error clearing localStorage:', err);
      }
      
      // Call server-side logout route to properly clear cookies
      console.log('Calling server-side logout route...');
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Important: include cookies in the request
        });
        
        if (response.ok) {
          console.log('Server-side logout successful');
        } else {
          console.error('Server-side logout failed:', response.statusText);
        }
      } catch (err) {
        console.error('Error calling logout API:', err);
      }
      
      // Also call client-side signOut to ensure cookies are cleared
      console.log('Calling client-side signOut...');
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Error in client-side signOut:', error);
        } else {
          console.log('Client-side signOut successful');
        }
      } catch (err) {
        console.error('Error in client-side signOut:', err);
      }
      
      // Manually clear Supabase cookies as a backup
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (supabaseUrl) {
          const projectRef = supabaseUrl.split('//')[1]?.split('.')[0];
          if (projectRef) {
            // Clear the main auth cookie
            document.cookie = `sb-${projectRef}-auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
            document.cookie = `sb-${projectRef}-auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            console.log('Manually cleared Supabase cookies');
          }
        }
      } catch (err) {
        console.error('Error manually clearing cookies:', err);
      }
      
      // Wait a bit to ensure cookies are cleared
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Logout completed');
    } catch (error) {
      console.error('Error logging out:', error);
      // Still clear local state even if there's an error
      setUser(null);
      setSession(null);
    } finally {
      // Reset flag after a longer delay to ensure cookies are cleared and prevent re-login
      // Keep the flag for 5 seconds to prevent session restoration
      setTimeout(() => {
        isLoggingOutRef.current = false;
        try {
          sessionStorage.removeItem('isLoggingOut');
          sessionStorage.removeItem('isLoggingOutTimestamp');
        } catch (err) {
          console.error('Error removing sessionStorage:', err);
        }
        console.log('Logout flag reset');
      }, 5000); // Increased to 5 seconds to prevent immediate re-login
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, login, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

