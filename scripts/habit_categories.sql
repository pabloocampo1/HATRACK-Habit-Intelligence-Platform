-- Tabla de categorías de hábitos (ejecutar en Supabase SQL Editor)
-- Cada usuario tiene categorías del sistema + las que cree.

CREATE TABLE IF NOT EXISTS habit_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#10b981',
  icon TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT habit_categories_user_slug_unique UNIQUE (user_id, slug)
);

CREATE INDEX IF NOT EXISTS habit_categories_user_id_idx ON habit_categories (user_id);

ALTER TABLE habit_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own habit categories" ON habit_categories;
CREATE POLICY "Users manage own habit categories"
  ON habit_categories
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
