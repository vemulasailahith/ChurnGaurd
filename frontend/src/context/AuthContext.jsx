import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [member, setMember] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  /**
   * Verifies that the user is an authorized company member and is active.
   * Also verifies the optional company domain if configured.
   */
  const verifyMemberStatus = useCallback(async (authUser) => {
    if (!authUser) {
      return { isAuthorized: false, member: null, error: null };
    }

    // 1. Optional company email domain verification
    const allowedDomain = (import.meta.env.VITE_ALLOWED_COMPANY_DOMAIN || '').trim().toLowerCase();
    if (allowedDomain) {
      const email = (authUser.email || '').toLowerCase();
      if (!email.endsWith(`@${allowedDomain}`)) {
        return {
          isAuthorized: false,
          member: null,
          error: `Access Denied: Email domain must belong to '@${allowedDomain}'.`,
        };
      }
    }

    // 2. Query authorized_members table in Supabase
    try {
      const { data, error } = await supabase
        .from('authorized_members')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (error) {
        console.error('Error verifying authorized member status:', error);
        if (error.message?.includes('schema cache') || error.code === 'PGRST205' || error.message?.includes('authorized_members')) {
          return {
            isAuthorized: false,
            member: null,
            error: "Database table required: 'authorized_members' table does not exist in Supabase yet. Please execute the SQL migration in your Supabase SQL Editor.",
          };
        }
        return {
          isAuthorized: false,
          member: null,
          error: `Authorization check failed: ${error.message}`,
        };
      }

      if (!data) {
        return {
          isAuthorized: false,
          member: null,
          error: 'Access Denied: Your account is not recognized as an authorized company member.',
        };
      }

      if (!data.is_active) {
        return {
          isAuthorized: false,
          member: data,
          error: 'Access Denied: Your authorized company member account is deactivated.',
        };
      }

      return {
        isAuthorized: true,
        member: data,
        error: null,
      };
    } catch (err) {
      console.error('Membership check failed:', err);
      return {
        isAuthorized: false,
        member: null,
        error: 'Unable to verify membership status.',
      };
    }
  }, []);

  /**
   * Initializes session and listens for authentication state changes.
   */
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Fetch initial session
    supabase.auth.getSession().then(async ({ data: { session: initialSession }, error }) => {
      if (!isMounted) return;

      if (error || !initialSession) {
        setUser(null);
        setSession(null);
        setMember(null);
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      const verification = await verifyMemberStatus(initialSession.user);
      if (!isMounted) return;

      if (verification.isAuthorized) {
        setUser(initialSession.user);
        setSession(initialSession);
        setMember(verification.member);
        setIsAuthorized(true);
        setAuthError(null);
      } else {
        // User is authenticated in Supabase but not an authorized member
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setMember(null);
        setIsAuthorized(false);
        setAuthError(verification.error);
      }
      setLoading(false);
    });

    // Listen for state changes (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, INITIAL_SESSION)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT' || !newSession) {
        setUser(null);
        setSession(null);
        setMember(null);
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const verification = await verifyMemberStatus(newSession.user);
        if (!isMounted) return;

        if (verification.isAuthorized) {
          setUser(newSession.user);
          setSession(newSession);
          setMember(verification.member);
          setIsAuthorized(true);
          setAuthError(null);
        } else {
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setMember(null);
          setIsAuthorized(false);
          setAuthError(verification.error);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [verifyMemberStatus]);

  /**
   * Log in with Email and Password using Supabase Auth.
   * Performs authorization and domain check immediately after authentication.
   */
  const login = async (email, password) => {
    setAuthError(null);

    if (!isSupabaseConfigured) {
      const err = new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env.');
      setAuthError(err.message);
      throw err;
    }

    const trimmedEmail = email.trim();

    // Optional early domain check
    const allowedDomain = (import.meta.env.VITE_ALLOWED_COMPANY_DOMAIN || '').trim().toLowerCase();
    if (allowedDomain && !trimmedEmail.toLowerCase().endsWith(`@${allowedDomain}`)) {
      const msg = `Access Denied: Email domain must belong to '@${allowedDomain}'.`;
      setAuthError(msg);
      throw new Error(msg);
    }

    // Supabase Auth sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (error) {
      setAuthError(error.message);
      throw error;
    }

    // Verify authorized member record
    const verification = await verifyMemberStatus(data.user);

    if (!verification.isAuthorized) {
      // Must sign the user out if they are not an active authorized member
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setMember(null);
      setIsAuthorized(false);
      const msg = verification.error || 'Access Denied: You are not an authorized company member.';
      setAuthError(msg);
      throw new Error(msg);
    }

    // Success: user is authenticated and authorized
    setUser(data.user);
    setSession(data.session);
    setMember(verification.member);
    setIsAuthorized(true);
    setAuthError(null);

    return verification.member;
  };

  /**
   * Log out using Supabase Auth and reset state.
   */
  const logout = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Error during Supabase signOut:', err);
    } finally {
      setUser(null);
      setSession(null);
      setMember(null);
      setIsAuthorized(false);
      setAuthError(null);
    }
  };

  const value = {
    user,
    session,
    member,
    isAuthorized,
    loading,
    authError,
    setAuthError,
    login,
    logout,
    isSupabaseConfigured,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { useAuth } from './useAuth';
export default AuthProvider;
