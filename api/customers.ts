import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        const { data: customers, error: getError } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });

        if (getError) throw getError;
        return res.status(200).json(customers || []);

      case 'POST':
        const { name, email, phone, address, city, state, pincode } = req.body;
        if (!name) {
          return res.status(400).json({ message: 'Name is required' });
        }

        const { data: newCustomer, error: postError } = await supabase
          .from('customers')
          .insert({ name, email, phone, address, city, state, pincode })
          .select()
          .single();

        if (postError) throw postError;
        return res.status(201).json(newCustomer);

      case 'PATCH':
        const { id } = req.query;
        if (!id || typeof id !== 'string') {
          return res.status(400).json({ message: 'Customer ID is required' });
        }

        const { data: updatedCustomer, error: patchError } = await supabase
          .from('customers')
          .update({ ...req.body, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (patchError) throw patchError;
        return res.status(200).json(updatedCustomer);

      case 'DELETE':
        const deleteId = req.query.id;
        if (!deleteId || typeof deleteId !== 'string') {
          return res.status(400).json({ message: 'Customer ID is required' });
        }

        const { error: deleteError } = await supabase
          .from('customers')
          .delete()
          .eq('id', deleteId);

        if (deleteError) throw deleteError;
        return res.status(204).end();

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Customers API error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

