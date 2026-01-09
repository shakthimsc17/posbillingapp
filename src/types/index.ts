export interface Category {
  id: string;
  customer_id: string;
  name: string;
  subcategory?: string;
  brand?: string;
  created_at: string;
}

export interface Item {
  id: string;
  customer_id: string;
  name: string;
  code: string;
  barcode?: string;
  category_id?: string;
  subcategory?: string;
  cost: number;
  price: number;
  mrp?: number;
  stock: number;
  image_url?: string;
  created_at: string;
}

export interface CartItem {
  item: Item;
  quantity: number;
  subtotal: number;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  password_hash?: string; // For authentication (not returned to client)
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  customer_id: string; // The customer who owns this transaction (the seller/store owner)
  transaction_customer_id?: string; // The customer who made the purchase (buyer)
  total_amount: number;
  payment_method: 'cash' | 'card' | 'upi';
  received_amount?: number;
  change_amount?: number;
  items_json: string;
  created_at: string;
}

