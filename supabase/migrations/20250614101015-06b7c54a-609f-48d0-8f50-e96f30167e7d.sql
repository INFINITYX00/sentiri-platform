
-- Create materials table
CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  quantity DECIMAL NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  dimensions TEXT,
  origin TEXT,
  description TEXT,
  image_url TEXT,
  qr_code TEXT UNIQUE NOT NULL,
  carbon_footprint DECIMAL NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create material passports table
CREATE TABLE public.material_passports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
  specifications JSONB DEFAULT '{}',
  origin JSONB DEFAULT '{}',
  carbon_data JSONB DEFAULT '{}',
  sustainability JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create BOMs (Bill of Materials) table
CREATE TABLE public.boms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  materials JSONB DEFAULT '[]',
  total_carbon DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'planning',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  allocated_materials TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for material images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'material-images',
  'material-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Enable RLS on all tables
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_passports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a demo app)
-- You can make these more restrictive later with user authentication

CREATE POLICY "Anyone can view materials" ON public.materials FOR SELECT USING (true);
CREATE POLICY "Anyone can insert materials" ON public.materials FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update materials" ON public.materials FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete materials" ON public.materials FOR DELETE USING (true);

CREATE POLICY "Anyone can view material_passports" ON public.material_passports FOR SELECT USING (true);
CREATE POLICY "Anyone can insert material_passports" ON public.material_passports FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update material_passports" ON public.material_passports FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete material_passports" ON public.material_passports FOR DELETE USING (true);

CREATE POLICY "Anyone can view boms" ON public.boms FOR SELECT USING (true);
CREATE POLICY "Anyone can insert boms" ON public.boms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update boms" ON public.boms FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete boms" ON public.boms FOR DELETE USING (true);

CREATE POLICY "Anyone can view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Anyone can insert projects" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update projects" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete projects" ON public.projects FOR DELETE USING (true);

-- Storage policies for material images
CREATE POLICY "Anyone can upload material images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'material-images');
CREATE POLICY "Anyone can view material images" ON storage.objects FOR SELECT USING (bucket_id = 'material-images');
CREATE POLICY "Anyone can update material images" ON storage.objects FOR UPDATE USING (bucket_id = 'material-images');
CREATE POLICY "Anyone can delete material images" ON storage.objects FOR DELETE USING (bucket_id = 'material-images');
