import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { ADMIN_EMAIL, SUPER_ADMIN_EMAIL } from '../lib/constants';
import { getUserTimezone } from '../lib/dateUtils';
import { syncDirectoryUserLink } from '../lib/directoryUserLink';
import { hasAuthCallbackParams, completeAuthCallbackFromUrl, isPasswordRecoveryUrl } from '../lib/authCallback';
import { logAuditEventSafe } from '../lib/auditLog';
import type { AuthError, Session, User as SupabaseUser } from '@supabase/supabase-js';

function splitName(fullName: string): { first_name: string; last_name: string } {
  const idx = fullName.indexOf(' ');
  if (idx > 0) return { first_name: fullName.slice(0, idx), last_name: fullName.slice(idx + 1) };
  return { first_name: fullName, last_name: '' };
}

function buildFallbackUser(su: SupabaseUser): User {
  const isAdminEmail = su.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const isSuperAdmin = su.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  const fullName = su.user_metadata?.full_name || su.email?.split('@')[0] || 'User';
  const { first_name, last_name } = su.user_metadata?.first_name
    ? { first_name: su.user_metadata.first_name as string, last_name: (su.user_metadata.last_name as string) || '' }
    : splitName(fullName);
  return {
    id: su.id,
    email: su.email || '',
    phone: su.phone || undefined,
    first_name,
    last_name,
    name: [first_name, last_name].filter(Boolean).join(' '),
    is_approved: isAdminEmail,
    role: isAdminEmail ? 'admin' : 'member',
    is_super_admin: isSuperAdmin,
  };
}

export type SignUpResult = {
  needsEmailVerification: boolean;
  emailAlreadyRegistered: boolean;
  resentConfirmation: boolean;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, firstName: string, lastName: string, phone?: string) => Promise<SignUpResult>;
  resendSignupConfirmation: (email: string) => Promise<void>;
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
          void syncDirectoryUserLink(supabaseUser, profile);
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
        const fb = buildFallbackUser(supabaseUser);
        void syncDirectoryUserLink(supabaseUser, fb);
        return fb;
      }

      const { data, error } = result as any;

      if (error) {
        // If user doesn't exist in users table, create one
        if (error.code === 'PGRST116') {
          const newUser = buildFallbackUser(supabaseUser);

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
          void syncDirectoryUserLink(supabaseUser, newUser);
          return newUser;
        }
        
        const fallbackUser = buildFallbackUser(supabaseUser);
        userProfileCache.current = { userId: supabaseUser.id, profile: fallbackUser, timestamp: Date.now() };
        void syncDirectoryUserLink(supabaseUser, fallbackUser);
        return fallbackUser;
      }

      const userData = data as User;
      const isAdminEmail = userData.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      const isSuperAdminEmail = userData.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
      
      // Do timezone and admin updates asynchronously (don't block)
      const currentTimezone = getUserTimezone();
      const needsTimezoneUpdate = !userData.user_timezone;
      const needsAdminUpdate = isAdminEmail && (userData.role !== 'admin' || !userData.is_approved);
      const needsSuperAdminUpdate = isSuperAdminEmail && !userData.is_super_admin;
      
      if (needsTimezoneUpdate || needsAdminUpdate || needsSuperAdminUpdate) {
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
        if (needsSuperAdminUpdate) {
          updateData.is_super_admin = true;
          userData.is_super_admin = true;
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
      void syncDirectoryUserLink(supabaseUser, userData);
      return userData;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      const fb = buildFallbackUser(supabaseUser);
      void syncDirectoryUserLink(supabaseUser, fb);
      return fb;
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
            userProfile = buildFallbackUser(session.user);
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

    // Listen for auth changes — defer async work to avoid blocking Supabase auth (deadlock with verifyOtp etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthContext - Auth state changed:', event, session ? 'has session' : 'no session');

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (event === 'PASSWORD_RECOVERY') {
        setIsLoading(false);
        return;
      }

      if (event === 'INITIAL_SESSION') {
        initialSessionReceived = true;
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        if (!session?.user) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        setTimeout(async () => {
          let userProfile: User | null = null;
          try {
            userProfile = await fetchUserProfile(session.user, true);
          } catch (error) {
            console.error('AuthContext - Error in profile fetch during INITIAL_SESSION, using fallback:', error);
            userProfile = buildFallbackUser(session.user);
          }

          if (!isMounted) return;

          if (userProfile) {
            setUser(userProfile);
          } else {
            setUser(null);
          }
          setIsLoading(false);
        }, 0);
        return;
      }

      if (event === 'TOKEN_REFRESHED') {
        if (!initialSessionReceived) {
          initialSessionReceived = true;
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          setIsLoading(false);
        }
        return;
      }

      if (!session?.user) return;

      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      setIsLoading(true);
      setTimeout(async () => {
        let userProfile: User | null = null;
        try {
          userProfile = await fetchUserProfile(session.user, true);
        } catch (error) {
          console.error('AuthContext - Error in profile fetch, using fallback:', error);
          userProfile = buildFallbackUser(session.user);
        }

        if (!isMounted) return;

        if (userProfile) {
          setUser(userProfile);
        }
        if (!initialSessionReceived) {
          initialSessionReceived = true;
        }
        setIsLoading(false);
      }, 0);
    });

    // Handle OAuth / email-confirmation callback params on initial load (not password recovery)
    const handleOAuthCallback = async () => {
      if (isPasswordRecoveryUrl() || !hasAuthCallbackParams()) {
        return;
      }

      console.log('AuthContext - Auth callback params detected, processing...');
      const { error: callbackError } = await completeAuthCallbackFromUrl();
      if (callbackError) {
        console.warn('AuthContext - Callback exchange failed:', callbackError);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userProfile = await fetchUserProfile(session.user);
        if (userProfile) {
          const userTimezone = getUserTimezone();
          if (!userProfile.user_timezone) {
            await supabase
              .from('users')
              .update({ user_timezone: userTimezone })
              .eq('id', session.user.id);
            userProfile.user_timezone = userTimezone;
          }
          setUser(userProfile);
          logAuditEventSafe({
            action: 'login',
            category: 'auth',
            entityType: 'users',
            entityId: userProfile.id,
            summary: `${userProfile.email} signed in via OAuth or email confirmation`,
            details: { method: 'oauth_or_callback' },
          });
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
        logAuditEventSafe({
          action: 'login',
          category: 'auth',
          entityType: 'users',
          entityId: userProfile.id,
          summary: `${userProfile.email} signed in with email and password`,
          details: { method: 'email' },
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      logAuditEventSafe({
        action: 'login_failed',
        category: 'auth',
        summary: `Failed login attempt for ${email}`,
        details: { method: 'email', email },
        actorRoleOverride: 'anonymous',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getSiteBaseUrl = () => {
    const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
    return siteUrl.replace(/\/$/, '');
  };

  const getSignupConfirmationRedirect = () =>
    getAuthEmailRedirectUrl('/auth/callback');

  const resendSignupConfirmation = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: getSignupConfirmationRedirect(),
      },
    });
    if (error) throw error;
  };

  const signUpWithEmail = async (email: string, password: string, firstName: string, lastName: string, phone?: string) => {
    setIsLoading(true);
    try {
      const userTimezone = getUserTimezone();
      const fullName = [firstName, lastName].filter(Boolean).join(' ');
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: getSignupConfirmationRedirect(),
          data: {
            full_name: fullName,
            first_name: firstName,
            last_name: lastName,
            phone: phone || null,
            timezone: userTimezone,
          },
        },
      });

      if (error) throw error;

      const emailAlreadyRegistered =
        !!data.user && (data.user.identities?.length ?? 0) === 0;
      const isAlreadyConfirmed = !!data.user?.email_confirmed_at;
      let resentConfirmation = false;

      if (emailAlreadyRegistered && data.user && !isAlreadyConfirmed) {
        await resendSignupConfirmation(email);
        resentConfirmation = true;
      }

      const needsEmailVerification =
        (!data.session && !!data.user && !emailAlreadyRegistered) ||
        (emailAlreadyRegistered && !isAlreadyConfirmed);

      if (data.user && data.session) {
        const userProfile = await fetchUserProfile(data.user);
        if (userProfile && !userProfile.user_timezone) {
          await supabase
            .from('users')
            .update({ user_timezone: userTimezone })
            .eq('id', data.user.id);
          userProfile.user_timezone = userTimezone;
        }
        setUser(userProfile);
      }

      if (data.user) {
        logAuditEventSafe({
          action: 'signup',
          category: 'auth',
          entityType: 'users',
          entityId: data.user.id,
          summary: `New account signup: ${email.trim().toLowerCase()}`,
          details: { method: 'email', needsEmailVerification },
        });
      }

      return { needsEmailVerification, emailAlreadyRegistered, resentConfirmation };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      // Determine the correct redirect URL
      // Priority: 1. Environment variable, 2. Current origin (if not localhost), 3. Current origin as fallback
      const envSiteUrl = import.meta.env.VITE_SITE_URL;
      const currentOrigin = window.location.origin;
      const isLocalhost = currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1');
      
      let siteUrl: string;
      if (envSiteUrl) {
        siteUrl = envSiteUrl;
        console.log('signInWithGoogle - Using VITE_SITE_URL from environment:', siteUrl);
      } else if (!isLocalhost) {
        // In production but no env var - use current origin
        siteUrl = currentOrigin;
        console.warn('signInWithGoogle - No VITE_SITE_URL set, using current origin:', siteUrl);
      } else {
        // Localhost - use current origin
        siteUrl = currentOrigin;
        console.log('signInWithGoogle - Development mode, using current origin:', siteUrl);
      }
      
      const baseUrl = siteUrl.replace(/\/$/, ''); // Remove trailing slash if present
      const redirectUrl = `${baseUrl}/#/auth/callback`;
      
      console.log('signInWithGoogle - Final redirect URL:', redirectUrl);
      console.log('signInWithGoogle - Current location:', {
        origin: window.location.origin,
        hostname: window.location.hostname,
        href: window.location.href,
        envSiteUrl: envSiteUrl || 'NOT SET',
        isLocalhost
      });
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('signInWithGoogle - Supabase OAuth error:', error);
        throw error;
      }

      logAuditEventSafe({
        action: 'login',
        category: 'auth',
        summary: 'Google sign-in initiated',
        details: { method: 'google', step: 'redirect' },
      });
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    const currentUser = user;
    try {
      if (currentUser) {
        logAuditEventSafe({
          action: 'logout',
          category: 'auth',
          entityType: 'users',
          entityId: currentUser.id,
          summary: `${currentUser.email} signed out`,
          details: { method: 'manual' },
        });
      }
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
        redirectTo: getAuthEmailRedirectUrl('/reset-password'),
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
        signUpWithEmail,
        resendSignupConfirmation,
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