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
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Category ID is required' });
    }

    switch (req.method) {
      case 'PATCH':
        const { data: updatedCategory, error: patchError } = await supabase
          .from('categories')
          .update(req.body)
          .eq('id', id)
          .select()
          .single();

        if (patchError) throw patchError;
        return res.status(200).json(updatedCategory);

      case 'DELETE':
        const { error: deleteError } = await supabase
          .from('categories')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;
        return res.status(204).end();

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Category API error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

