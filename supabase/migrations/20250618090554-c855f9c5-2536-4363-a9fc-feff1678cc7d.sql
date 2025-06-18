
-- Create companies table for multi-tenant support
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  subscription_status TEXT DEFAULT 'trial',
  subscription_tier TEXT DEFAULT 'basic',
  subscription_end TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT UNIQUE,
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '14 days'),
  max_materials INTEGER DEFAULT 50,
  max_projects INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscribers table for Stripe integration
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  subscription_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_status TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add company_id to existing tables for data isolation
ALTER TABLE public.materials ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.projects ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.boms ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.material_passports ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.product_passports ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.manufacturing_stages ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.time_entries ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.energy_records ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.transport_routes ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.shipments ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.takeback_items ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.design_suggestions ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Enable RLS on new tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get current user's company
CREATE OR REPLACE FUNCTION public.get_current_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create RLS policies for companies
CREATE POLICY "Users can view their own company" ON public.companies
  FOR SELECT USING (id = public.get_current_user_company_id());

CREATE POLICY "Users can update their own company" ON public.companies
  FOR UPDATE USING (id = public.get_current_user_company_id());

-- Create RLS policies for profiles
CREATE POLICY "Users can view profiles in their company" ON public.profiles
  FOR SELECT USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Service role can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for subscribers
CREATE POLICY "Users can view their company subscription" ON public.subscribers
  FOR SELECT USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Service role can manage subscriptions" ON public.subscribers
  FOR ALL USING (true);

-- Update RLS policies for existing tables to filter by company
CREATE POLICY "Users can view company materials" ON public.materials
  FOR SELECT USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can insert company materials" ON public.materials
  FOR INSERT WITH CHECK (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can update company materials" ON public.materials
  FOR UPDATE USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can delete company materials" ON public.materials
  FOR DELETE USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can view company projects" ON public.projects
  FOR SELECT USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can insert company projects" ON public.projects
  FOR INSERT WITH CHECK (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can update company projects" ON public.projects
  FOR UPDATE USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can delete company projects" ON public.projects
  FOR DELETE USING (company_id = public.get_current_user_company_id());

-- Apply similar policies to other tables
CREATE POLICY "Users can view company BOMs" ON public.boms
  FOR SELECT USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can insert company BOMs" ON public.boms
  FOR INSERT WITH CHECK (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can update company BOMs" ON public.boms
  FOR UPDATE USING (company_id = public.get_current_user_company_id());

CREATE POLICY "Users can delete company BOMs" ON public.boms
  FOR DELETE USING (company_id = public.get_current_user_company_id());

-- Create trigger function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- This will be called when a user signs up, but we'll handle company/profile creation in the application
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger for companies
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
