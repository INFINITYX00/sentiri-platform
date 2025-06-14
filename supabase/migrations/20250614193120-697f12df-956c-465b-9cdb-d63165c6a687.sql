
-- Add projects_materials junction table to track which materials are used in projects
CREATE TABLE public.projects_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE NOT NULL,
  quantity_required NUMERIC NOT NULL DEFAULT 0,
  quantity_consumed NUMERIC NOT NULL DEFAULT 0,
  cost_per_unit NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add product_passports table for finished products
CREATE TABLE public.product_passports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  product_name TEXT NOT NULL,
  product_type TEXT NOT NULL DEFAULT 'manufactured',
  quantity_produced INTEGER NOT NULL DEFAULT 1,
  total_carbon_footprint NUMERIC NOT NULL DEFAULT 0,
  qr_code TEXT UNIQUE NOT NULL,
  qr_image_url TEXT,
  image_url TEXT,
  specifications JSONB DEFAULT '{}',
  production_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add additional fields to projects table
ALTER TABLE public.projects 
ADD COLUMN total_cost NUMERIC DEFAULT 0,
ADD COLUMN total_carbon_footprint NUMERIC DEFAULT 0,
ADD COLUMN start_date DATE,
ADD COLUMN completion_date DATE,
ADD COLUMN description TEXT;

-- Enable RLS on new tables
ALTER TABLE public.projects_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_passports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access
CREATE POLICY "Allow all operations on projects_materials" ON public.projects_materials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on product_passports" ON public.product_passports FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_projects_materials_project_id ON public.projects_materials(project_id);
CREATE INDEX idx_projects_materials_material_id ON public.projects_materials(material_id);
CREATE INDEX idx_product_passports_project_id ON public.product_passports(project_id);
CREATE INDEX idx_product_passports_qr_code ON public.product_passports(qr_code);
