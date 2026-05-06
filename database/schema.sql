CREATE TABLE claims (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp DEFAULT now(),
  claim_text text,
  verdict text,
  fake_percentage integer,
  confidence integer,
  topic text,
  input_type text,
  source_url text,
  real_version text,
  climate_evidence text,
  news_evidence text,
  emotional_language boolean
);

CREATE POLICY "allow insert for all"
ON claims FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "allow select for all"
ON claims FOR SELECT
TO anon
USING (true);
