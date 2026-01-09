import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Customer } from '../types';

interface AuthStore {
  customer: Customer | null;
  loading: boolean;
  initialized: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any; needsEmailConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

// Store customer in localStorage for persistence
const CUSTOMER_STORAGE_KEY = 'pos_customer';

export const useAuthStore = create<AuthStore>((set, get) => ({
  customer: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    if (!supabase) {
      set({ initialized: true });
      return;
    }

    try {
      set({ loading: true });
      
      // Try to restore customer from localStorage
      const storedCustomer = localStorage.getItem(CUSTOMER_STORAGE_KEY);
      if (storedCustomer) {
        try {
          const customer = JSON.parse(storedCustomer);
          // Verify customer still exists and is valid
          const { data, error } = await supabase
            .from('customers')
            .select('id, name, email, phone, address, city, state, pincode, created_at, updated_at')
            .eq('id', customer.id)
            .single();
          
          if (!error && data) {
            set({
              customer: data,
              initialized: true,
              loading: false,
            });
            return;
          }
        } catch (e) {
          console.error('Error restoring customer session:', e);
          localStorage.removeItem(CUSTOMER_STORAGE_KEY);
        }
      }
      
      set({
        customer: null,
        initialized: true,
        loading: false,
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

      // Clean email
      const cleanEmail = email.trim().toLowerCase();
      const customerName = name || cleanEmail.split('@')[0] || 'Customer';
      
      console.log('Creating customer account:', { name: customerName, email: cleanEmail });
      
      // Call database function to create customer with hashed password
      const { data, error } = await supabase.rpc('create_customer_account', {
        p_name: customerName,
        p_email: cleanEmail,
        p_password: password,
        p_phone: null,
        p_address: null,
        p_city: null,
        p_state: null,
        p_pincode: null,
      });

      if (error) {
        console.error('Customer signup error:', error);
        set({ loading: false });
        
        let errorMessage = error.message || 'Failed to create account';
        
        // Handle specific errors
        if (error.message?.includes('already registered') || error.message?.includes('duplicate')) {
          errorMessage = 'This email is already registered. Please sign in instead.';
        }
        
        return { error: { ...error, message: errorMessage } };
      }

      if (!data || data.length === 0) {
        set({ loading: false });
        return { error: { message: 'Failed to create account. Please try again.' } };
      }

      const newCustomer = data[0];
      
      // Fetch full customer data
      const { data: fullCustomer, error: fetchError } = await supabase
        .from('customers')
        .select('id, name, email, phone, address, city, state, pincode, created_at, updated_at')
        .eq('id', newCustomer.id)
        .single();

      if (fetchError || !fullCustomer) {
        set({ loading: false });
        return { error: { message: 'Account created but failed to retrieve customer data' } };
      }

      // Store customer in state and localStorage
      set({
        customer: fullCustomer,
        loading: false,
      });
      
      localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(fullCustomer));
      
      console.log('✅ Customer account created successfully:', fullCustomer);

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
      
      const cleanEmail = email.trim().toLowerCase();
      
      console.log('Authenticating customer:', { email: cleanEmail });
      
      // Call database function to authenticate customer
      const { data, error } = await supabase.rpc('authenticate_customer', {
        p_email: cleanEmail,
        p_password: password,
      });

      if (error) {
        console.error('Customer signin error:', error);
        set({ loading: false });
        
        let errorMessage = error.message || 'Failed to sign in';
        
        if (error.message?.includes('Invalid email or password')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        }
        
        return { error: { ...error, message: errorMessage } };
      }

      if (!data || data.length === 0) {
        set({ loading: false });
        return { error: { message: 'Invalid email or password' } };
      }

      const customer = data[0];
      
      // Store customer in state and localStorage
      set({
        customer: customer,
        loading: false,
      });
      
      localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customer));
      
      console.log('✅ Customer authenticated successfully:', customer);

      return { error: null };
    } catch (error: any) {
      console.error('SignIn exception:', error);
      set({ loading: false });
      return { error: error?.message ? { message: error.message } : { message: 'An unexpected error occurred' } };
    }
  },

  signOut: async () => {
    try {
      set({ loading: true });
      
      // Clear customer from state and localStorage
      localStorage.removeItem(CUSTOMER_STORAGE_KEY);
      
      set({
        customer: null,
        loading: false,
      });
      
      console.log('✅ Customer signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      set({ loading: false });
    }
  },
}));
