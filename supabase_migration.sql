-- ============================================================
-- GymFood Supabase Schema & Seed Data
-- Run this in the Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Categories ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  icon TEXT NOT NULL
);

INSERT INTO categories (id, label, icon) VALUES
  ('meat', 'Meat', 'food-drumstick'),
  ('veggies', 'Vegetables', 'food-apple'),
  ('drinks', 'Drinks', 'cup'),
  ('cheat-day', 'Cheat Day', 'french-fries')
ON CONFLICT (id) DO NOTHING;

-- ── 2. Meals ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS meals (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id),
  name TEXT NOT NULL,
  calories INT NOT NULL,
  protein INT NOT NULL,
  carbs INT NOT NULL,
  fat INT NOT NULL,
  price INT NOT NULL,
  image TEXT NOT NULL
);

INSERT INTO meals (id, category_id, name, calories, protein, carbs, fat, price, image) VALUES
  ('fish-n-chips',         'meat',    'Fish N Chips',          800, 20, 30, 10, 26000, 'https://images.unsplash.com/photo-1601924579440-3ccde5b9dfd4'),
  ('fish-salmon',          'meat',    'Fish Salmon',           450, 25, 15, 12, 42000, 'https://images.unsplash.com/photo-1612197527762-9d59b6d6efb2'),
  ('beef-steak',           'meat',    'Beef Steak',            950, 40, 20, 18, 35000, 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092'),
  ('spaghetti-carbonara',  'meat',    'Spaghetti Carbonara',   850, 18, 55, 22, 35000, 'https://images.unsplash.com/photo-1589307004393-75c7f4a3ba00'),
  ('spaghetti-carbonara1', 'meat',    'Spaghetti Carbonara',   850, 18, 55, 22, 35000, 'https://images.unsplash.com/photo-1589307004393-75c7f4a3ba00'),
  ('spaghetti-carbonara2', 'meat',    'Spaghetti Carbonara',   850, 18, 55, 22, 35000, 'https://images.unsplash.com/photo-1589307004393-75c7f4a3ba00'),
  ('spaghetti-carbonara3', 'meat',    'Spaghetti Carbonara',   850, 18, 55, 22, 35000, 'https://images.unsplash.com/photo-1589307004393-75c7f4a3ba00'),
  ('spaghetti-carbonara4', 'veggies', 'Spaghetti Carbonara',   850, 18, 55, 22, 35000, 'https://images.unsplash.com/photo-1589307004393-75c7f4a3ba00'),
  ('spaghetti-carbonara5', 'veggies', 'Spaghetti Carbonara',   850, 18, 55, 22, 35000, 'https://images.unsplash.com/photo-1589307004393-75c7f4a3ba00'),
  ('spaghetti-carbonara6', 'veggies', 'Spaghetti Carbonara',   850, 18, 55, 22, 35000, 'https://images.unsplash.com/photo-1589307004393-75c7f4a3ba00')
ON CONFLICT (id) DO NOTHING;

-- ── 3. Forum Categories ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL UNIQUE
);

INSERT INTO forum_categories (label) VALUES
  ('Healthy Recipes'),
  ('Fitness & Diet'),
  ('Lunchbox Ideas'),
  ('Snacks')
ON CONFLICT (label) DO NOTHING;

-- ── 4. Forum Posts ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  title TEXT NOT NULL,
  category TEXT,
  image TEXT,
  description TEXT NOT NULL,
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  bookmarks INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO forum_posts (author_name, author_avatar, title, category, image, description, likes, comments, bookmarks) VALUES
  (
    'Stewart',
    'https://example.com/avatars/stewart.jpg',
    '7 Days Menu',
    'Healthy Recipes',
    'https://example.com/posts/7-days-menu.jpg',
    E'Need inspiration so you don''t get confused about what to cook every day? 🥗\nIn this forum, we can share ideas for healthy meals that are easy to prepare and delicious!',
    201, 12, 10
  ),
  (
    'Felto',
    'https://example.com/avatars/felto.jpg',
    'Healthy LunchBox',
    'Lunchbox Ideas',
    'https://example.com/posts/healthy-lunchbox.jpg',
    'Simple and healthy lunchbox ideas for your busy weekdays! Pack your meals with balanced nutrition and great taste.',
    84, 5, 7
  );

-- ── 5. Subscription Plans ────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_plan TEXT NOT NULL UNIQUE,
  important_notes TEXT[] NOT NULL,
  image TEXT NOT NULL
);

INSERT INTO subscription_plans (subscription_plan, important_notes, image) VALUES
  (
    'Beginner',
    ARRAY['💪 Basic exercises using simple equipment', '🧑‍🏫 Step-by-step guidance from an instructor', '🕒 Flexible schedule & light intensity'],
    'beginner.png'
  ),
  (
    'Advanced',
    ARRAY['🔥 Intense strength & cardio combination training', '🧑‍🏫 Personal trainer for progress evaluation', '🧘 Access to additional classes (HIIT, yoga, pilates)'],
    'advanced.png'
  ),
  (
    'Pro',
    ARRAY['🏋️ Full access to all gym facilities & exclusive classes', '🧑‍🏫 1-on-1 coaching with a senior trainer', '🍽️ Personalized nutrition plan & dedicated meal prep support'],
    'pro.png'
  )
ON CONFLICT (subscription_plan) DO NOTHING;

-- ── 6. Orders (user-scoped) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  items JSONB NOT NULL,
  total_amount INT NOT NULL,
  paid_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 7. Consultation Orders (user-scoped) ─────────────────────
CREATE TABLE IF NOT EXISTS consultation_orders (
  id TEXT PRIMARY KEY,
  plan_name TEXT NOT NULL,
  plan_image TEXT NOT NULL,
  plan_notes TEXT[] NOT NULL,
  paid_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Migration: Add status to existing consultation_orders ────
-- (safe to run even if column already exists)
ALTER TABLE consultation_orders
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

-- ── Done! ────────────────────────────────────────────────────
-- All tables created and seed data inserted.
