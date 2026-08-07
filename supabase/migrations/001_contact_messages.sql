-- Run this in the Supabase SQL Editor to create the contact messages table.
-- https://app.supabase.com → your project → SQL Editor

CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS and create policies
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public contact form)
CREATE POLICY "Allow public inserts" ON contact_messages
  FOR INSERT TO anon
  WITH CHECK (true);

-- Only admins can read messages
CREATE POLICY "Allow admin reads" ON contact_messages
  FOR SELECT TO authenticated
  USING (true);

-- Only admins can update (mark as read)
CREATE POLICY "Allow admin updates" ON contact_messages
  FOR UPDATE TO authenticated
  USING (true);
