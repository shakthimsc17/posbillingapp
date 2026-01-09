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
    switch (req.method) {
      case 'GET':
        const { data: categories, error: getError } = await supabase
          .from('categories')
          .select('*')
          .order('created_at', { ascending: false });

        if (getError) throw getError;
        return res.status(200).json(categories || []);

      case 'POST':
        const { name, icon, color } = req.body;
        if (!name) {
          return res.status(400).json({ message: 'Name is required' });
        }

        const { data: newCategory, error: postError } = await supabase
          .from('categories')
          .insert({ name, icon, color })
          .select()
          .single();

        if (postError) throw postError;
        return res.status(201).json(newCategory);


      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Categories API error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

