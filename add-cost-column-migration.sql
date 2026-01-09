-- Migration: Add cost column to items table
-- Run this in Supabase SQL Editor to add the cost field for profit/loss calculations

-- Add cost column to items table
ALTER TABLE items ADD COLUMN IF NOT EXISTS cost DECIMAL(10, 2);

-- For existing items, you may want to set a default cost value
-- Uncomment and modify the line below if you want to set existing items' cost to their current price
-- UPDATE items SET cost = price WHERE cost IS NULL;

-- Optional: Set cost as NOT NULL after updating existing data
-- ALTER TABLE items ALTER COLUMN cost SET NOT NULL;

