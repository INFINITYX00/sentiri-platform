
-- Time logging table
CREATE TABLE public.time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  task TEXT NOT NULL,
  duration NUMERIC NOT NULL,
  worker TEXT NOT NULL,
  hourly_rate NUMERIC NOT NULL,
  cost NUMERIC NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Manufacturing stages table
CREATE TABLE public.manufacturing_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  stage_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  progress INTEGER NOT NULL DEFAULT 0,
  estimated_hours NUMERIC NOT NULL DEFAULT 0,
  actual_hours NUMERIC NOT NULL DEFAULT 0,
  energy_estimate NUMERIC NOT NULL DEFAULT 0,
  actual_energy NUMERIC NOT NULL DEFAULT 0,
  workers TEXT[] NOT NULL DEFAULT '{}',
  start_date DATE,
  completed_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Energy consumption records
CREATE TABLE public.energy_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  equipment_name TEXT NOT NULL,
  equipment_type TEXT NOT NULL,
  power_rating NUMERIC NOT NULL,
  hours_used NUMERIC NOT NULL,
  energy_consumed NUMERIC NOT NULL,
  efficiency INTEGER NOT NULL,
  carbon_factor NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Transport routes table
CREATE TABLE public.transport_routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  distance NUMERIC NOT NULL,
  transport_type TEXT NOT NULL,
  carbon_impact NUMERIC NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Shipments table
CREATE TABLE public.shipments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_number TEXT NOT NULL UNIQUE,
  destination TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'preparing',
  estimated_arrival DATE NOT NULL,
  actual_arrival DATE,
  carrier TEXT NOT NULL,
  items TEXT[] NOT NULL DEFAULT '{}',
  carbon_offset BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Takeback items table
CREATE TABLE public.takeback_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  request_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested',
  scheduled_date DATE,
  assessment_notes TEXT,
  recovery_value NUMERIC NOT NULL DEFAULT 0,
  carbon_saved NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Design suggestions table
CREATE TABLE public.design_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact TEXT NOT NULL DEFAULT 'medium',
  implementation_effort TEXT NOT NULL DEFAULT 'medium',
  applied BOOLEAN NOT NULL DEFAULT false,
  materials_saved TEXT,
  carbon_reduction NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manufacturing_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.takeback_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_suggestions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (since no authentication is implemented yet)
CREATE POLICY "Allow all operations on time_entries" ON public.time_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on manufacturing_stages" ON public.manufacturing_stages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on energy_records" ON public.energy_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on transport_routes" ON public.transport_routes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on shipments" ON public.shipments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on takeback_items" ON public.takeback_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on design_suggestions" ON public.design_suggestions FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_time_entries_project_id ON public.time_entries(project_id);
CREATE INDEX idx_manufacturing_stages_project_id ON public.manufacturing_stages(project_id);
CREATE INDEX idx_energy_records_project_id ON public.energy_records(project_id);
CREATE INDEX idx_transport_routes_date ON public.transport_routes(date);
CREATE INDEX idx_shipments_status ON public.shipments(status);
CREATE INDEX idx_takeback_items_status ON public.takeback_items(status);
CREATE INDEX idx_design_suggestions_applied ON public.design_suggestions(applied);
