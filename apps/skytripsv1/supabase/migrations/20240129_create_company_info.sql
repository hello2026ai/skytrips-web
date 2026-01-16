-- Create the company_info table
CREATE TABLE IF NOT EXISTS company_info (
  company_name TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read company_info
-- This is appropriate for public contact information
CREATE POLICY "Allow public read access" ON company_info
  FOR SELECT
  USING (true);

-- Create a policy that restricts insert/update/delete to service role only (implicit default deny for anon)
-- Ideally, you would have authenticated admin roles, but for now we rely on the default deny for anon/authenticated users without specific policies.

-- Insert initial data for Skytrips
INSERT INTO company_info (company_name, email, phone_number)
VALUES ('Skytrips', 'support@skytrips.com', '+1 (555) 123-4567')
ON CONFLICT (company_name) DO UPDATE
SET email = EXCLUDED.email,
    phone_number = EXCLUDED.phone_number;
