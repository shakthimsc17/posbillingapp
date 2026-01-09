-- Migration script to update existing database schema
-- Run this in Supabase SQL Editor if you already have the old schema

-- Step 1: Update categories table
ALTER TABLE categories DROP COLUMN IF EXISTS icon;
ALTER TABLE categories DROP COLUMN IF EXISTS color;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS subcategory VARCHAR(255);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS brand VARCHAR(255);

-- Step 2: Add user_id to categories (if not exists)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS user_id UUID;
-- Note: For existing data, you have two options:
-- Option A: Delete existing data (recommended for fresh start)
-- DELETE FROM categories WHERE user_id IS NULL;
-- Option B: Assign to a specific user (replace 'your-user-id' with actual UUID)
-- UPDATE categories SET user_id = 'your-user-id' WHERE user_id IS NULL;
-- After assigning user_id, uncomment the next lines:
-- ALTER TABLE categories ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE categories ADD CONSTRAINT categories_user_id_fkey 
--   FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 3: Update items table
ALTER TABLE items ADD COLUMN IF NOT EXISTS subcategory VARCHAR(255);
ALTER TABLE items ADD COLUMN IF NOT EXISTS cost DECIMAL(10, 2);

-- Step 4: Add user_id to items (if not exists)
ALTER TABLE items ADD COLUMN IF NOT EXISTS user_id UUID;
-- Note: For existing data, delete or assign user_id (see Step 2 for options)
-- After handling existing data, uncomment:
-- ALTER TABLE items ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE items ADD CONSTRAINT items_user_id_fkey 
--   FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 5: Add user_id to transactions (if not exists)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_id UUID;
-- Note: For existing data, delete or assign user_id (see Step 2 for options)
-- After handling existing data, uncomment:
-- ALTER TABLE transactions ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE transactions ADD CONSTRAINT transactions_user_id_fkey 
--   FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- Step 7: Update RLS policies
-- Drop old policies
DROP POLICY IF EXISTS "Allow all operations on categories" ON categories;
DROP POLICY IF EXISTS "Allow all operations on items" ON items;
DROP POLICY IF EXISTS "Allow all operations on customers" ON customers;
DROP POLICY IF EXISTS "Allow all operations on transactions" ON transactions;

-- Drop new policies if they exist (to allow re-running)
DROP POLICY IF EXISTS "Users can view own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;

DROP POLICY IF EXISTS "Users can view own items" ON items;
DROP POLICY IF EXISTS "Users can insert own items" ON items;
DROP POLICY IF EXISTS "Users can update own items" ON items;
DROP POLICY IF EXISTS "Users can delete own items" ON items;

DROP POLICY IF EXISTS "Users can view own customers" ON customers;
DROP POLICY IF EXISTS "Users can insert own customers" ON customers;
DROP POLICY IF EXISTS "Users can update own customers" ON customers;
DROP POLICY IF EXISTS "Users can delete own customers" ON customers;

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;

-- Create user-specific policies
CREATE POLICY "Users can view own categories" ON categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own items" ON items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own items" ON items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items" ON items
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own items" ON items
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Verify changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'categories' 
ORDER BY ordinal_position;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'items' 
ORDER BY ordinal_position;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY ordinal_position;

