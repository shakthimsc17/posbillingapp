import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Handle search query
    if (req.method === 'GET' && req.query.q) {
      const query = req.query.q as string;
      const { data: items, error } = await supabase
        .from('items')
        .select('*')
        .or(`name.ilike.%${query}%,code.ilike.%${query}%,barcode.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json(items || []);
    }

    // Handle barcode lookup
    if (req.method === 'GET' && req.query.barcode) {
      const barcode = req.query.barcode as string;
      const { data: item, error } = await supabase
        .from('items')
        .select('*')
        .eq('barcode', barcode)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return res.status(200).json(item || null);
    }

    switch (req.method) {
      case 'GET':
        const { data: items, error: getError } = await supabase
          .from('items')
          .select('*')
          .order('created_at', { ascending: false });

        if (getError) throw getError;
        return res.status(200).json(items || []);

      case 'POST':
        const { name, code, barcode, category_id, price, mrp, stock, image_url } = req.body;
        if (!name || !code || price === undefined) {
          return res.status(400).json({ message: 'Name, code, and price are required' });
        }

        const { data: newItem, error: postError } = await supabase
          .from('items')
          .insert({ name, code, barcode, category_id, price, mrp, stock: stock || 0, image_url })
          .select()
          .single();

        if (postError) throw postError;
        return res.status(201).json(newItem);


      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Items API error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

