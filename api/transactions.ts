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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        const { data: transactions, error: getError } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (getError) throw getError;
        return res.status(200).json(transactions || []);

      case 'POST':
        const { total_amount, payment_method, received_amount, change_amount, items_json } = req.body;
        if (!total_amount || !payment_method) {
          return res.status(400).json({ message: 'Total amount and payment method are required' });
        }

        const { data: newTransaction, error: postError } = await supabase
          .from('transactions')
          .insert({
            total_amount,
            payment_method,
            received_amount,
            change_amount,
            items_json: typeof items_json === 'string' ? items_json : JSON.stringify(items_json),
          })
          .select()
          .single();

        if (postError) throw postError;
        return res.status(201).json(newTransaction);

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Transactions API error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

