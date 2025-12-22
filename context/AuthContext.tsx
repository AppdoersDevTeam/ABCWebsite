import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { ADMIN_EMAIL } from '../lib/constants';
import { getUserTimezone } from '../lib/dateUtils';
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
  // Cache user profile to avoid redundant fetches
  const userProfileCache = React.useRef<{ userId: string; profile: User; timestamp: number } | null>(null);
  const CACHE_DURATION = 30000; // 30 seconds cache

  // Fetch user profile from database with caching and optimizations
  const fetchUserProfile = async (supabaseUser: SupabaseUser, useCache: boolean = true): Promise<User | null> => {
    try {
      // Check cache first
      if (useCache && userProfileCache.current) {
        const { userId, profile, timestamp } = userProfileCache.current;
        if (userId === supabaseUser.id && Date.now() - timestamp < CACHE_DURATION) {
          console.log('fetchUserProfile - Using cached profile');
          return profile;
        }
      }

      console.log('fetchUserProfile - Fetching profile for user ID:', supabaseUser.id);
      
      // Use a shorter timeout (3 seconds instead of 5)
      const queryPromise = supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
      
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), 3000);
      });
      
      const result = await Promise.race([queryPromise, timeoutPromise]);
      
      if (!result) {
        console.warn('fetchUserProfile - Query timed out, using fallback');
        const isAdminEmail = supabaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        const fallbackUser: User = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          phone: supabaseUser.phone || undefined,
          name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
          is_approved: isAdminEmail,
          role: isAdminEmail ? 'admin' : 'member',
        };
        return fallbackUser;
      }

      const { data, error } = result as any;

      if (error) {
        // If user doesn't exist in users table, create one
        if (error.code === 'PGRST116') {
          const isAdminEmail = supabaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
          
          const newUser: User = {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            phone: supabaseUser.phone || undefined,
            name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
            is_approved: isAdminEmail,
            role: isAdminEmail ? 'admin' : 'member',
          };

          // Insert new user into database (don't await - do it in background)
          supabase
            .from('users')
            .insert([newUser])
            .select()
            .single()
            .then(({ data: insertedUser }) => {
              if (insertedUser) {
                userProfileCache.current = { userId: supabaseUser.id, profile: insertedUser, timestamp: Date.now() };
              }
            })
            .catch((insertError) => {
              console.error('Error creating user profile:', insertError);
            });

          // Cache and return immediately
          userProfileCache.current = { userId: supabaseUser.id, profile: newUser, timestamp: Date.now() };
          return newUser;
        }
        
        // Create fallback user profile
        const isAdminEmail = supabaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        const fallbackUser: User = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          phone: supabaseUser.phone || undefined,
          name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
          is_approved: isAdminEmail,
          role: isAdminEmail ? 'admin' : 'member',
        };
        userProfileCache.current = { userId: supabaseUser.id, profile: fallbackUser, timestamp: Date.now() };
        return fallbackUser;
      }

      const userData = data as User;
      const isAdminEmail = userData.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      
      // Do timezone and admin updates asynchronously (don't block)
      const currentTimezone = getUserTimezone();
      const needsTimezoneUpdate = !userData.user_timezone;
      const needsAdminUpdate = isAdminEmail && (userData.role !== 'admin' || !userData.is_approved);
      
      if (needsTimezoneUpdate || needsAdminUpdate) {
        // Update in background - don't wait for it
        const updateData: any = {};
        if (needsTimezoneUpdate) {
          updateData.user_timezone = currentTimezone;
          userData.user_timezone = currentTimezone;
        }
        if (needsAdminUpdate) {
          updateData.role = 'admin';
          updateData.is_approved = true;
          userData.role = 'admin';
          userData.is_approved = true;
        }
        
        supabase
          .from('users')
          .update(updateData)
          .eq('id', supabaseUser.id)
          .then(() => {
            // Update cache after successful update
            userProfileCache.current = { userId: supabaseUser.id, profile: userData, timestamp: Date.now() };
          })
          .catch((updateError) => {
            console.error('Error updating user:', updateError);
          });
      }

      // Cache the profile
      userProfileCache.current = { userId: supabaseUser.id, profile: userData, timestamp: Date.now() };
      return userData;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Return fallback on error
      const isAdminEmail = supabaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      const fallbackUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        phone: supabaseUser.phone || undefined,
        name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
        is_approved: isAdminEmail,
        role: isAdminEmail ? 'admin' : 'member',
      };
      return fallbackUser;
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
          
          // Fetch profile (with cache enabled for faster loading)
          let userProfile: User | null = null;
          try {
            userProfile = await fetchUserProfile(session.user, true);
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

    // Add timeout to prevent infinite loading (reduced to 5 seconds for faster UX)
    timeoutId = setTimeout(() => {
      if (isMounted && !initialSessionReceived) {
        console.warn('AuthContext - Auth initialization timeout, forcing isLoading to false');
        initialSessionReceived = true;
        setIsLoading(false);
      }
    }, 5000); // Reduced timeout to 5 seconds

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
          
          // Fetch profile (with cache enabled)
          let userProfile: User | null = null;
          try {
            userProfile = await fetchUserProfile(session.user, true);
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
        
        // Fetch profile (with cache enabled)
        let userProfile: User | null = null;
        try {
          userProfile = await fetchUserProfile(session.user, true);
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
            // Ensure timezone is set for OAuth users
            const userTimezone = getUserTimezone();
            if (!userProfile.user_timezone) {
              await supabase
                .from('users')
                .update({ user_timezone: userTimezone })
                .eq('id', session.user.id);
              userProfile.user_timezone = userTimezone;
            }
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
        // Clear cache to force fresh fetch on login
        userProfileCache.current = null;
        // Single profile fetch (no redundant calls)
        const userProfile = await fetchUserProfile(data.user, false);
        
        if (!userProfile) {
          throw new Error('Failed to fetch or create user profile. Please contact support.');
        }
        setUser(userProfile);
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
      const userTimezone = getUserTimezone();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone: phone || null,
            timezone: userTimezone,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // User profile will be created in fetchUserProfile
        const userProfile = await fetchUserProfile(data.user);
        // Ensure timezone is set in the user profile
        if (userProfile && !userProfile.user_timezone) {
          await supabase
            .from('users')
            .update({ user_timezone: userTimezone })
            .eq('id', data.user.id);
          userProfile.user_timezone = userTimezone;
        }
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
      const userTimezone = getUserTimezone();
      const { data, error } = await supabase.auth.signUp({
        phone,
        password,
        options: {
          data: {
            full_name: name,
            email: email || null,
            timezone: userTimezone,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        const userProfile = await fetchUserProfile(data.user);
        // Ensure timezone is set in the user profile
        if (userProfile && !userProfile.user_timezone) {
          await supabase
            .from('users')
            .update({ user_timezone: userTimezone })
            .eq('id', data.user.id);
          userProfile.user_timezone = userTimezone;
        }
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
        // Clear cache to force fresh fetch
        userProfileCache.current = null;
        const userProfile = await fetchUserProfile(session.user, false);
        if (userProfile) {
          setUser(userProfile);
        } else {
          console.warn('refreshUserProfile - Failed to fetch profile');
        }
      } else {
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