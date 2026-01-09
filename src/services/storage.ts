import { Category, Item, Transaction, Customer } from '../types';
import { apiService } from './api';
import { supabase } from '../lib/supabase';

// Priority: Supabase (primary) > API (for Vercel serverless functions)
// NO localStorage fallback - throw errors if Supabase is not available
const useSupabase = supabase !== null && !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
const useAPI = !useSupabase && !!import.meta.env.VITE_API_BASE;

// Validate Supabase configuration
if (!useSupabase && !useAPI) {
  console.error('❌ CRITICAL: No storage backend configured!');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
  throw new Error('Database configuration missing. Please configure Supabase credentials.');
}

// Debug logging
console.log('💾 Storage Configuration:', {
  useSupabase: useSupabase ? '✅ YES - Using Supabase' : '❌ NO',
  useAPI: useAPI ? '✅ YES - Using API' : '❌ NO',
  hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  supabaseClient: supabase !== null ? '✅ Created' : '❌ Not created',
});

// Helper function to ensure Supabase is available
function ensureSupabase() {
  if (!useSupabase || !supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
  }
  return supabase;
}

// Helper function to get current user ID
async function getCurrentUserId(): Promise<string> {
  const client = ensureSupabase();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) {
    throw new Error('User not authenticated. Please sign in.');
  }
  return user.id;
}

export const storageService = {
  // Categories
  getCategories: async (): Promise<Category[]> => {
    if (useSupabase) {
      try {
        const client = ensureSupabase();
        console.log('📥 Loading categories from Supabase...');
        const { data, error } = await client
          .from('categories')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) {
          console.error('❌ Supabase error loading categories:', error);
          throw new Error(`Failed to load categories: ${error.message}`);
        }
        console.log(`✅ Loaded ${data?.length || 0} categories from Supabase`);
        return data || [];
      } catch (error) {
        console.error('❌ Error loading categories:', error);
        throw error;
      }
    }
    if (useAPI) {
      return apiService.getCategories();
    }
    throw new Error('No storage backend available');
  },

  addCategory: async (category: Omit<Category, 'id' | 'created_at' | 'user_id'>): Promise<Category> => {
    if (useSupabase) {
      try {
        const client = ensureSupabase();
        const userId = await getCurrentUserId();
        console.log('💾 Saving category to Supabase:', category);
        const { data, error } = await client
          .from('categories')
          .insert({ ...category, user_id: userId })
          .select()
          .single();
        if (error) {
          console.error('❌ Supabase error:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          throw new Error(`Failed to save category: ${error.message} (Code: ${error.code || 'unknown'})`);
        }
        console.log('✅ Category saved to Supabase:', data);
        return data;
      } catch (error) {
        console.error('❌ Error saving category:', error);
        throw error;
      }
    }
    if (useAPI) {
      return apiService.addCategory(category);
    }
    throw new Error('No storage backend available');
  },

  updateCategory: async (id: string, updates: Partial<Category>): Promise<void> => {
    if (useSupabase) {
      const client = ensureSupabase();
      const { error } = await client
        .from('categories')
        .update(updates)
        .eq('id', id);
      if (error) {
        throw new Error(`Failed to update category: ${error.message} (Code: ${error.code || 'unknown'})`);
      }
      return;
    }
    if (useAPI) {
      return apiService.updateCategory(id, updates);
    }
    throw new Error('No storage backend available');
  },

  deleteCategory: async (id: string): Promise<void> => {
    if (useSupabase) {
      const client = ensureSupabase();
      const { error } = await client
        .from('categories')
        .delete()
        .eq('id', id);
      if (error) {
        throw new Error(`Failed to delete category: ${error.message} (Code: ${error.code || 'unknown'})`);
      }
      return;
    }
    if (useAPI) {
      return apiService.deleteCategory(id);
    }
    throw new Error('No storage backend available');
  },

  // Items
  getItems: async (): Promise<Item[]> => {
    if (useSupabase) {
      const client = ensureSupabase();
      const { data, error } = await client
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        throw new Error(`Failed to load items: ${error.message} (Code: ${error.code || 'unknown'})`);
      }
      return data || [];
    }
    if (useAPI) {
      return apiService.getItems();
    }
    throw new Error('No storage backend available');
  },

  addItem: async (item: Omit<Item, 'id' | 'created_at' | 'user_id'>): Promise<Item> => {
    if (useSupabase) {
      const client = ensureSupabase();
      const userId = await getCurrentUserId();
      console.log('💾 Saving item to Supabase:', item);
      const { data, error } = await client
        .from('items')
        .insert({ ...item, user_id: userId })
        .select()
        .single();
      if (error) {
        console.error('❌ Supabase error:', error);
        throw new Error(`Failed to save item: ${error.message} (Code: ${error.code || 'unknown'})`);
      }
      console.log('✅ Item saved to Supabase:', data);
      return data;
    }
    if (useAPI) {
      return apiService.addItem(item);
    }
    throw new Error('No storage backend available');
  },

  updateItem: async (id: string, updates: Partial<Item>): Promise<void> => {
    if (useSupabase) {
      const client = ensureSupabase();
      const { error } = await client
        .from('items')
        .update(updates)
        .eq('id', id);
      if (error) {
        throw new Error(`Failed to update item: ${error.message} (Code: ${error.code || 'unknown'})`);
      }
      return;
    }
    if (useAPI) {
      return apiService.updateItem(id, updates);
    }
    throw new Error('No storage backend available');
  },

  deleteItem: async (id: string): Promise<void> => {
    if (useSupabase) {
      const client = ensureSupabase();
      const { error } = await client
        .from('items')
        .delete()
        .eq('id', id);
      if (error) {
        throw new Error(`Failed to delete item: ${error.message} (Code: ${error.code || 'unknown'})`);
      }
      return;
    }
    if (useAPI) {
      return apiService.deleteItem(id);
    }
    throw new Error('No storage backend available');
  },

  searchItems: async (query: string): Promise<Item[]> => {
    if (useSupabase) {
      const client = ensureSupabase();
      const { data, error } = await client
        .from('items')
        .select('*')
        .or(`name.ilike.%${query}%,code.ilike.%${query}%,barcode.ilike.%${query}%`)
        .order('created_at', { ascending: false });
      if (error) {
        throw new Error(`Failed to search items: ${error.message} (Code: ${error.code || 'unknown'})`);
      }
      return data || [];
    }
    if (useAPI) {
      return apiService.searchItems(query);
    }
    throw new Error('No storage backend available');
  },

  getItemByBarcode: async (barcode: string): Promise<Item | null> => {
    if (useSupabase) {
      const client = ensureSupabase();
      const { data, error } = await client
        .from('items')
        .select('*')
        .eq('barcode', barcode)
        .single();
      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to get item by barcode: ${error.message} (Code: ${error.code || 'unknown'})`);
      }
      return data || null;
    }
    if (useAPI) {
      return apiService.getItemByBarcode(barcode);
    }
    throw new Error('No storage backend available');
  },

  // Transactions
  getTransactions: async (): Promise<Transaction[]> => {
    if (useSupabase) {
      const client = ensureSupabase();
      const { data, error } = await client
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        throw new Error(`Failed to load transactions: ${error.message} (Code: ${error.code || 'unknown'})`);
      }
      return data || [];
    }
    if (useAPI) {
      return apiService.getTransactions();
    }
    throw new Error('No storage backend available');
  },

  addTransaction: async (transaction: Omit<Transaction, 'id' | 'created_at' | 'user_id'>): Promise<Transaction> => {
    if (useSupabase) {
      const client = ensureSupabase();
      const userId = await getCurrentUserId();
      const { data, error } = await client
        .from('transactions')
        .insert({ ...transaction, user_id: userId })
        .select()
        .single();
      if (error) {
        throw new Error(`Failed to save transaction: ${error.message} (Code: ${error.code || 'unknown'})`);
      }
      return data;
    }
    if (useAPI) {
      return apiService.addTransaction(transaction);
    }
    throw new Error('No storage backend available');
  },

  // Customers
  getCustomers: async (): Promise<Customer[]> => {
    if (useSupabase) {
      const client = ensureSupabase();
      const { data, error } = await client
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        throw new Error(`Failed to load customers: ${error.message} (Code: ${error.code || 'unknown'})`);
      }
      return data || [];
    }
    if (useAPI) {
      return apiService.getCustomers();
    }
    throw new Error('No storage backend available');
  },

  addCustomer: async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Customer> => {
    if (useSupabase) {
      const client = ensureSupabase();
      const userId = await getCurrentUserId();
      const { data, error } = await client
        .from('customers')
        .insert({ ...customer, user_id: userId })
        .select()
        .single();
      if (error) {
        throw new Error(`Failed to save customer: ${error.message} (Code: ${error.code || 'unknown'})`);
      }
      return data;
    }
    if (useAPI) {
      return apiService.addCustomer(customer);
    }
    throw new Error('No storage backend available');
  },

  updateCustomer: async (id: string, updates: Partial<Customer>): Promise<void> => {
    if (useSupabase) {
      const client = ensureSupabase();
      const { error } = await client
        .from('customers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) {
        throw new Error(`Failed to update customer: ${error.message} (Code: ${error.code || 'unknown'})`);
      }
      return;
    }
    if (useAPI) {
      return apiService.updateCustomer(id, updates);
    }
    throw new Error('No storage backend available');
  },

  deleteCustomer: async (id: string): Promise<void> => {
    if (useSupabase) {
      const client = ensureSupabase();
      const { error } = await client
        .from('customers')
        .delete()
        .eq('id', id);
      if (error) {
        throw new Error(`Failed to delete customer: ${error.message} (Code: ${error.code || 'unknown'})`);
      }
      return;
    }
    if (useAPI) {
      return apiService.deleteCustomer(id);
    }
    throw new Error('No storage backend available');
  },
};

