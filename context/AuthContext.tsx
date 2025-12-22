import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { ADMIN_EMAIL } from '../lib/constants';
import type { AuthError, Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithPhone: (phone: string, password?: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  signUpWithPhone: (phone: string, password: string, name: string, email?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  sendPasswordReset: (email: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren<{}>) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from database
  const fetchUserProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      console.log('fetchUserProfile - Fetching profile for user ID:', supabaseUser.id, 'email:', supabaseUser.email);
      
      // Add timeout wrapper
      let queryCompleted = false;
      const timeoutId = setTimeout(() => {
        if (!queryCompleted) {
          console.warn('fetchUserProfile - Query is taking longer than expected, may be hanging');
        }
      }, 5000);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
      
      queryCompleted = true;
      clearTimeout(timeoutId);
      
      console.log('fetchUserProfile - Query result:', { 
        hasData: !!data, 
        error: error?.message || null,
        errorCode: error?.code || null,
        errorDetails: error?.details || null,
        errorHint: error?.hint || null,
        userData: data ? {
          id: data.id,
          email: data.email,
          name: data.name,
          is_approved: (data as any).is_approved,
          role: (data as any).role
        } : null
      });

      if (error) {
        // If user doesn't exist in users table, create one
        if (error.code === 'PGRST116') {
          const isAdminEmail = supabaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
          
          const newUser: User = {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            phone: supabaseUser.phone || undefined,
            name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
            is_approved: isAdminEmail, // Admin email is auto-approved
            role: isAdminEmail ? 'admin' : 'member',
          };

          // Insert new user into database
          const { data: insertedUser, error: insertError } = await supabase
            .from('users')
            .insert([newUser])
            .select()
            .single();

          if (insertError) {
            console.error('Error creating user profile:', insertError);
            console.error('Insert error details:', {
              code: insertError.code,
              message: insertError.message,
              details: insertError.details,
              hint: insertError.hint
            });
            // Don't return null - try to return the user we tried to create
            // This allows login to proceed even if insert fails (user might exist from trigger)
            console.warn('Returning fallback user profile - may need manual fix');
            return newUser;
          }

          console.log('User profile created successfully:', insertedUser);
          return insertedUser || newUser;
        }
        console.error('Error fetching user profile:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // If query failed but we have a session, create a fallback user profile
        // This allows the app to continue functioning even if the database query fails
        const isAdminEmail = supabaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        console.warn('fetchUserProfile - Creating fallback user profile due to query error');
        const fallbackUser: User = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          phone: supabaseUser.phone || undefined,
          name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
          is_approved: isAdminEmail, // Admin email is auto-approved
          role: isAdminEmail ? 'admin' : 'member',
        };
        return fallbackUser;
      }

      // Check if user is the admin email and update if needed
      const userData = data as User;
      console.log('fetchUserProfile - User data retrieved:', {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        is_approved: userData.is_approved,
        role: userData.role
      });
      
      const isAdminEmail = userData.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      
      // If this is the admin email, ensure they have admin role and are approved
      if (isAdminEmail && (userData.role !== 'admin' || !userData.is_approved)) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ role: 'admin', is_approved: true })
          .eq('id', supabaseUser.id);

        if (updateError) {
          console.error('Error updating admin user:', updateError);
        } else {
          console.log('fetchUserProfile - Admin user updated, returning approved admin profile');
          return { ...userData, role: 'admin' as const, is_approved: true };
        }
      }

      console.log('fetchUserProfile - Returning user profile:', {
        id: userData.id,
        email: userData.email,
        is_approved: userData.is_approved,
        role: userData.role
      });
      return data as User;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Initialize session check
  useEffect(() => {
    console.log('AuthContext - Initializing auth');
    
    let isMounted = true;
    let initialSessionReceived = false;
    let timeoutId: NodeJS.Timeout | null = null;
    
    const initAuth = async () => {
      try {
        console.log('AuthContext - Getting session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (sessionError) {
          console.error('AuthContext - Session error:', sessionError);
          setUser(null);
          // Don't set loading to false here - wait for INITIAL_SESSION event
          return;
        }
        
        console.log('AuthContext - Session:', session ? 'exists' : 'null');
        
        if (session?.user) {
          console.log('AuthContext - User found, fetching profile...');
          // Keep loading true while fetching profile
          setIsLoading(true);
          
          // Wrap fetchUserProfile in a timeout to prevent hanging
          let userProfile: User | null = null;
          try {
            const fetchPromise = fetchUserProfile(session.user);
            const timeoutPromise = new Promise<User | null>((resolve) => {
              setTimeout(() => {
                console.warn('AuthContext - Profile fetch timed out in initAuth, using fallback user');
                const isAdminEmail = session.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
                resolve({
                  id: session.user.id,
                  email: session.user.email || '',
                  phone: session.user.phone || undefined,
                  name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                  is_approved: isAdminEmail,
                  role: isAdminEmail ? 'admin' : 'member',
                });
              }, 8000); // 8 second timeout
            });
            
            userProfile = await Promise.race([fetchPromise, timeoutPromise]);
          } catch (error) {
            console.error('AuthContext - Error in profile fetch in initAuth, using fallback:', error);
            const isAdminEmail = session.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
            userProfile = {
              id: session.user.id,
              email: session.user.email || '',
              phone: session.user.phone || undefined,
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              is_approved: isAdminEmail,
              role: isAdminEmail ? 'admin' : 'member',
            };
          }
          
          if (!isMounted) return;
          
          console.log('AuthContext - User profile:', userProfile);
          
          if (userProfile) {
            setUser(userProfile);
            // If we successfully fetched the profile, we can mark as received
            // But still wait for INITIAL_SESSION to set loading to false properly
            // This prevents the timeout from firing unnecessarily
            if (!initialSessionReceived) {
              // Set a shorter timeout as fallback if INITIAL_SESSION doesn't fire
              if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
              }
              // Set a new shorter timeout (5 seconds) as fallback
              timeoutId = setTimeout(() => {
                if (isMounted && !initialSessionReceived) {
                  console.warn('AuthContext - INITIAL_SESSION not received, using fallback');
                  initialSessionReceived = true;
                  setIsLoading(false);
                }
              }, 5000);
            }
          } else {
            console.error('AuthContext - Failed to fetch user profile but session exists');
            console.error('This might indicate:');
            console.error('1. User profile doesn\'t exist in public.users table');
            console.error('2. RLS policy is blocking the query');
            console.error('3. Database connection issue');
            // Don't set user to null immediately - wait a bit for potential trigger
            // Set a timeout to check again
            setTimeout(async () => {
              if (!isMounted) return;
              const retryProfile = await fetchUserProfile(session.user);
              if (retryProfile) {
                setUser(retryProfile);
              } else {
                setUser(null);
              }
              // Only set loading to false if we've received INITIAL_SESSION
              if (initialSessionReceived) {
                setIsLoading(false);
              }
            }, 2000);
            return;
          }
        } else {
          console.log('AuthContext - No session, setting user to null');
          setUser(null);
        }
      } catch (error) {
        console.error('AuthContext - Error initializing auth:', error);
        if (isMounted) {
          setUser(null);
        }
      }
      // Don't set loading to false here - wait for INITIAL_SESSION event
    };

    // Add timeout to prevent infinite loading (increased to 20 seconds to allow for slow profile fetches)
    timeoutId = setTimeout(() => {
      if (isMounted && !initialSessionReceived) {
        console.warn('AuthContext - Auth initialization timeout, forcing isLoading to false');
        initialSessionReceived = true;
        setIsLoading(false);
      }
    }, 20000); // Increased timeout to 20 seconds to allow for slow profile fetches

    initAuth().then(() => {
      // Don't clear timeout here - wait for INITIAL_SESSION event
    }).catch((error) => {
      console.error('AuthContext - Init auth promise rejected:', error);
      if (isMounted && !initialSessionReceived) {
        initialSessionReceived = true;
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext - Auth state changed:', event, session ? 'has session' : 'no session');
      
      // Handle different auth events
      if (event === 'SIGNED_OUT') {
        console.log('AuthContext - User signed out, clearing user state');
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      // INITIAL_SESSION is fired when Supabase has restored the session from storage
      if (event === 'INITIAL_SESSION') {
        console.log('AuthContext - Initial session restored from storage');
        initialSessionReceived = true;
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        
        if (session?.user) {
          console.log('AuthContext - Session restored, fetching profile...');
          // Keep loading true while fetching profile
          setIsLoading(true);
          
          // Wrap fetchUserProfile in a timeout to prevent hanging
          let userProfile: User | null = null;
          try {
            const fetchPromise = fetchUserProfile(session.user);
            const timeoutPromise = new Promise<User | null>((resolve) => {
              setTimeout(() => {
                console.warn('AuthContext - Profile fetch timed out during INITIAL_SESSION, using fallback user');
                const isAdminEmail = session.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
                resolve({
                  id: session.user.id,
                  email: session.user.email || '',
                  phone: session.user.phone || undefined,
                  name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                  is_approved: isAdminEmail,
                  role: isAdminEmail ? 'admin' : 'member',
                });
              }, 8000); // 8 second timeout
            });
            
            userProfile = await Promise.race([fetchPromise, timeoutPromise]);
          } catch (error) {
            console.error('AuthContext - Error in profile fetch during INITIAL_SESSION, using fallback:', error);
            const isAdminEmail = session.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
            userProfile = {
              id: session.user.id,
              email: session.user.email || '',
              phone: session.user.phone || undefined,
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              is_approved: isAdminEmail,
              role: isAdminEmail ? 'admin' : 'member',
            };
          }
          
          if (userProfile) {
            setUser(userProfile);
          } else {
            console.warn('AuthContext - User profile not found after session restore');
            setUser(null);
          }
        } else {
          console.log('AuthContext - No session restored');
          setUser(null);
        }
        setIsLoading(false);
        return;
      }
      
      if (session?.user) {
        console.log('AuthContext - Session user found, fetching profile...');
        // Clear any existing timeout since we're actively fetching
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        // Keep loading true while fetching profile
        setIsLoading(true);
        
        // Wrap fetchUserProfile in a timeout to prevent hanging
        let userProfile: User | null = null;
        try {
          const fetchPromise = fetchUserProfile(session.user);
          const timeoutPromise = new Promise<User | null>((resolve) => {
            setTimeout(() => {
              console.warn('AuthContext - Profile fetch timed out, using fallback user');
              const isAdminEmail = session.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
              resolve({
                id: session.user.id,
                email: session.user.email || '',
                phone: session.user.phone || undefined,
                name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                is_approved: isAdminEmail,
                role: isAdminEmail ? 'admin' : 'member',
              });
            }, 8000); // 8 second timeout
          });
          
          userProfile = await Promise.race([fetchPromise, timeoutPromise]);
        } catch (error) {
          console.error('AuthContext - Error in profile fetch, using fallback:', error);
          const isAdminEmail = session.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
          userProfile = {
            id: session.user.id,
            email: session.user.email || '',
            phone: session.user.phone || undefined,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            is_approved: isAdminEmail,
            role: isAdminEmail ? 'admin' : 'member',
          };
        }
        
        console.log('AuthContext - Fetched profile from auth state change:', userProfile);
        if (userProfile) {
          setUser(userProfile);
          // Mark initialization as complete and set loading to false
          // This handles the case where SIGNED_IN fires before INITIAL_SESSION
          if (!initialSessionReceived) {
            initialSessionReceived = true;
          }
          setIsLoading(false);
        } else {
          console.warn('AuthContext - User profile is null, but session exists. User may need profile creation.');
          // Don't set user to null if we have a session - this causes redirect loops
          // The profile might be created by the trigger, so we'll keep the session
          // Still mark as received to prevent timeout
          if (!initialSessionReceived) {
            initialSessionReceived = true;
          }
          setIsLoading(false);
        }
      } else if (event === 'TOKEN_REFRESHED') {
        // Token refreshed - session should still exist
        console.log('AuthContext - Token refreshed');
        if (!initialSessionReceived) {
          initialSessionReceived = true;
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          setIsLoading(false);
        }
      }
    });

    // Handle OAuth callback - check URL for hash fragments
    const handleOAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      
      if (accessToken) {
        console.log('AuthContext - OAuth callback detected, processing...');
        // Supabase should have already processed this, but we'll wait for the session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user);
          if (userProfile) {
            setUser(userProfile);
          }
        }
      }
    };

    handleOAuthCallback();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription.unsubscribe();
    };
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        console.log('Login successful, fetching user profile for:', data.user.email);
        const userProfile = await fetchUserProfile(data.user);
        console.log('Fetched user profile:', userProfile);
        
        if (!userProfile) {
          console.error('User profile is null - this should not happen');
          // Try to create it one more time
          const retryProfile = await fetchUserProfile(data.user);
          if (!retryProfile) {
            throw new Error('Failed to fetch or create user profile. Please contact support.');
          }
          setUser(retryProfile);
        } else {
          setUser(userProfile);
          // Refresh profile one more time to ensure we have the absolute latest data
          // This is important if user was just approved
          console.log('Login - Refreshing profile one more time to ensure latest approval status');
          const refreshedProfile = await fetchUserProfile(data.user);
          if (refreshedProfile) {
            setUser(refreshedProfile);
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPhone = async (phone: string, password?: string) => {
    setIsLoading(true);
    try {
      if (password) {
        // Phone + password login
        const { data, error } = await supabase.auth.signInWithPassword({
          phone,
          password,
        });

        if (error) throw error;

        if (data.user) {
          const userProfile = await fetchUserProfile(data.user);
          if (!userProfile) {
            throw new Error('Failed to fetch user profile');
          }
          setUser(userProfile);
        }
      } else {
        // Phone OTP login
        const { error } = await supabase.auth.signInWithOtp({
          phone,
        });

        if (error) throw error;
        // OTP sent, user will need to verify
      }
    } catch (error) {
      console.error('Phone login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string, phone?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone: phone || null,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // User profile will be created in fetchUserProfile
        const userProfile = await fetchUserProfile(data.user);
        setUser(userProfile);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithPhone = async (phone: string, password: string, name: string, email?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        phone,
        password,
        options: {
          data: {
            full_name: name,
            email: email || null,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        const userProfile = await fetchUserProfile(data.user);
        setUser(userProfile);
      }
    } catch (error) {
      console.error('Phone sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      // Ensure we don't have double slashes in the redirect URL
      const baseUrl = window.location.origin.replace(/\/$/, ''); // Remove trailing slash if present
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${baseUrl}/#/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const refreshUserProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log('refreshUserProfile - Refreshing profile for user:', session.user.id);
        const userProfile = await fetchUserProfile(session.user);
        if (userProfile) {
          console.log('refreshUserProfile - Profile refreshed:', userProfile);
          setUser(userProfile);
        } else {
          console.warn('refreshUserProfile - Failed to fetch profile');
        }
      } else {
        console.log('refreshUserProfile - No session found');
        setUser(null);
      }
    } catch (error) {
      console.error('refreshUserProfile - Error refreshing profile:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginWithEmail,
        loginWithPhone,
        signUpWithEmail,
        signUpWithPhone,
        signInWithGoogle,
        logout,
        isAuthenticated: !!user && user.is_approved,
        sendPasswordReset,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};