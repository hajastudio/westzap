-- HajaBot Database Setup for Supabase
-- Execute these commands in your Supabase SQL Editor

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  mensagem TEXT,
  plano TEXT,
  cep TEXT,
  status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'em_andamento', 'concluido')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mensagens table
CREATE TABLE IF NOT EXISTS mensagens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  id_lead UUID REFERENCES leads(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('enviada', 'recebida')),
  horario TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_telefone ON leads(telefone);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mensagens_id_lead ON mensagens(id_lead);
CREATE INDEX IF NOT EXISTS idx_mensagens_horario ON mensagens(horario DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens ENABLE ROW LEVEL SECURITY;

-- Create policies for leads table
DROP POLICY IF EXISTS "Enable read access for all users" ON leads;
DROP POLICY IF EXISTS "Enable insert access for all users" ON leads;
DROP POLICY IF EXISTS "Enable update access for all users" ON leads;
DROP POLICY IF EXISTS "Enable delete access for all users" ON leads;

CREATE POLICY "Enable read access for all users" ON leads FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON leads FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON leads FOR DELETE USING (true);

-- Create policies for mensagens table
DROP POLICY IF EXISTS "Enable read access for all users" ON mensagens;
DROP POLICY IF EXISTS "Enable insert access for all users" ON mensagens;
DROP POLICY IF EXISTS "Enable update access for all users" ON mensagens;
DROP POLICY IF EXISTS "Enable delete access for all users" ON mensagens;

CREATE POLICY "Enable read access for all users" ON mensagens FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON mensagens FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON mensagens FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON mensagens FOR DELETE USING (true);

-- Insert some sample data for testing (optional)
INSERT INTO leads (nome, telefone, mensagem, plano, status) VALUES
('João Silva', '+5511999999999', 'Olá, gostaria de saber mais sobre os planos', 'premium', 'novo'),
('Maria Santos', '+5511888888888', 'Tenho interesse no produto', 'basic', 'em_andamento'),
('Pedro Costa', '+5511777777777', 'Quando posso começar?', 'enterprise', 'concluido');

-- Insert some sample messages
INSERT INTO mensagens (id_lead, texto, tipo) 
SELECT id, 'Mensagem de teste recebida', 'recebida' FROM leads LIMIT 1;

INSERT INTO mensagens (id_lead, texto, tipo) 
SELECT id, 'Obrigado pelo contato! Em breve responderemos.', 'enviada' FROM leads LIMIT 1;

-- Verification queries (run these to check if everything is working)
SELECT 'leads' as table_name, COUNT(*) as count FROM leads
UNION ALL
SELECT 'mensagens' as table_name, COUNT(*) as count FROM mensagens;

-- Check table structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('leads', 'mensagens')
ORDER BY table_name, ordinal_position;
