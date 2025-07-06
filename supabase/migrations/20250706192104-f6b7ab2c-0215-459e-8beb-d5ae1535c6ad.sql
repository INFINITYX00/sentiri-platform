
-- Add RLS policy to allow users to create companies during signup
CREATE POLICY "Users can create companies during signup" 
  ON public.companies 
  FOR INSERT 
  WITH CHECK (true);
