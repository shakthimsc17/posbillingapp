import { Category, Item, Transaction, Customer } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const apiService = {
  // Categories
  getCategories: async (): Promise<Category[]> => {
    return apiRequest<Category[]>('/categories');
  },

  addCategory: async (category: Omit<Category, 'id' | 'created_at'>): Promise<Category> => {
    return apiRequest<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  },

  updateCategory: async (id: string, updates: Partial<Category>): Promise<void> => {
    await apiRequest(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  deleteCategory: async (id: string): Promise<void> => {
    await apiRequest(`/categories/${id}`, {
      method: 'DELETE',
    });
  },

  // Items
  getItems: async (): Promise<Item[]> => {
    return apiRequest<Item[]>('/items');
  },

  addItem: async (item: Omit<Item, 'id' | 'created_at'>): Promise<Item> => {
    return apiRequest<Item>('/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  updateItem: async (id: string, updates: Partial<Item>): Promise<void> => {
    await apiRequest(`/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  deleteItem: async (id: string): Promise<void> => {
    await apiRequest(`/items/${id}`, {
      method: 'DELETE',
    });
  },

  searchItems: async (query: string): Promise<Item[]> => {
    return apiRequest<Item[]>(`/items?q=${encodeURIComponent(query)}`);
  },

  getItemByBarcode: async (barcode: string): Promise<Item | null> => {
    return apiRequest<Item | null>(`/items?barcode=${encodeURIComponent(barcode)}`);
  },

  // Transactions
  getTransactions: async (): Promise<Transaction[]> => {
    return apiRequest<Transaction[]>('/transactions');
  },

  addTransaction: async (transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> => {
    return apiRequest<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  },

  // Customers
  getCustomers: async (): Promise<Customer[]> => {
    return apiRequest<Customer[]>('/customers');
  },

  addCustomer: async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> => {
    return apiRequest<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  },

  updateCustomer: async (id: string, updates: Partial<Customer>): Promise<void> => {
    await apiRequest(`/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  deleteCustomer: async (id: string): Promise<void> => {
    await apiRequest(`/customers/${id}`, {
      method: 'DELETE',
    });
  },
};

