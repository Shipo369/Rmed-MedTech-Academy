/*
  # Initial Database Setup

  1. New Tables
    - `custom_users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `password` (text)
      - `created_at` (timestamp)
      - `created_by` (uuid, references auth.users)

  2. Security
    - Enable RLS on `custom_users` table
    - Add policies for authenticated users to manage users
*/

CREATE TABLE IF NOT EXISTS custom_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE custom_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all custom users"
  ON custom_users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert custom users"
  ON custom_users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update custom users"
  ON custom_users
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete custom users"
  ON custom_users
  FOR DELETE
  TO authenticated
  USING (true);