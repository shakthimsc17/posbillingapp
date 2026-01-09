import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthStore {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any; needsEmailConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    if (!supabase) {
      set({ initialized: true });
      return;
    }

    try {
      set({ loading: true });
      
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      set({
        session,
        user: session?.user ?? null,
        initialized: true,
        loading: false,
      });

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          session,
          user: session?.user ?? null,
        });
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ initialized: true, loading: false });
    }
  },

  signUp: async (email: string, password: string, name?: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase not configured' } };
    }

    try {
      set({ loading: true });
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        set({ loading: false });
        return { error: { message: 'Please enter a valid email address' } };
      }

      // Validate password
      if (password.length < 6) {
        set({ loading: false });
        return { error: { message: 'Password must be at least 6 characters' } };
      }

      // Clean and validate email
      const cleanEmail = email.trim().toLowerCase();
      console.log('Attempting to sign up:', { originalEmail: email, cleanEmail, hasName: !!name });
      
      // Additional email validation - check for common issues
      if (cleanEmail.includes(' ')) {
        set({ loading: false });
        return { error: { message: 'Email cannot contain spaces' } };
      }
      
      if (cleanEmail.length > 254) {
        set({ loading: false });
        return { error: { message: 'Email address is too long' } };
      }
      
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            name: name || cleanEmail.split('@')[0],
            full_name: name || cleanEmail.split('@')[0],
          },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error('Supabase signUp error:', {
          message: error.message,
          status: error.status,
          name: error.name,
          fullError: error
        });
        set({ loading: false });
        
        // Provide more helpful error messages
        let errorMessage = error.message || 'Failed to create account';
        
        // Handle specific Supabase error codes
        if (error.status === 422 || error.message?.includes('invalid email')) {
          errorMessage = `Email validation failed: ${cleanEmail}. Please check:\n` +
            '- Email format is correct\n' +
            '- Email domain is allowed (check Supabase settings)\n' +
            '- Email is not blocked by your Supabase project';
        }
        
        return { error: { ...error, message: errorMessage } };
      }

      console.log('SignUp successful:', { 
        user: data.user?.id, 
        email: data.user?.email,
        needsConfirmation: !data.session 
      });

      // Note: If email confirmation is required, session will be null
      // User will need to check their email
      if (!data.session && data.user) {
        set({ loading: false });
        return { 
          error: null,
          needsEmailConfirmation: true
        };
      }

      set({
        user: data.user,
        session: data.session,
        loading: false,
      });

      return { error: null, needsEmailConfirmation: false };
    } catch (error: any) {
      console.error('SignUp exception:', error);
      set({ loading: false });
      return { error: error?.message ? { message: error.message } : { message: 'An unexpected error occurred' } };
    }
  },

  signIn: async (email: string, password: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase not configured' } };
    }

    try {
      set({ loading: true });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ loading: false });
        return { error };
      }

      set({
        user: data.user,
        session: data.session,
        loading: false,
      });

      return { error: null };
    } catch (error: any) {
      set({ loading: false });
      return { error };
    }
  },

  signOut: async () => {
    if (!supabase) return;

    try {
      set({ loading: true });
      await supabase.auth.signOut();
      set({
        user: null,
        session: null,
        loading: false,
      });
    } catch (error) {
      console.error('Error signing out:', error);
      set({ loading: false });
    }
  },
}));

