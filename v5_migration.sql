-- EXTENSION FOR LA CELESTE V5: SMART QR & CRM

-- 1. TABLES (Gestión de Mesas)
CREATE TABLE IF NOT EXISTS tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INTEGER UNIQUE NOT NULL,
  status TEXT DEFAULT 'free', -- 'free' | 'busy' | 'calling' | 'billing'
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CUSTOMERS (CRM & Fidelización)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_card TEXT UNIQUE NOT NULL, -- Cédula
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  points INTEGER DEFAULT 0,
  last_visit TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MODIFY ORDERS & DELIVERY NOTES (Añadir relaciones)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS table_id UUID REFERENCES tables(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_id_card TEXT;

ALTER TABLE delivery_notes ADD COLUMN IF NOT EXISTS table_id UUID REFERENCES tables(id);
ALTER TABLE delivery_notes ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);
ALTER TABLE delivery_notes ADD COLUMN IF NOT EXISTS customer_id_card TEXT;

-- 4. RLS FOR NEW TABLES
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Public read for tables (para que el cliente vea si está ocupada o llamar)
CREATE POLICY "Public read tables" ON tables FOR SELECT USING (active = TRUE);
CREATE POLICY "Public update tables status" ON tables FOR UPDATE USING (TRUE); -- Permitir llamar mesonero

-- Admin policies
CREATE POLICY "Admins can do everything on tables" ON tables FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can do everything on customers" ON customers FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- SEED SOME TABLES
INSERT INTO tables (number) VALUES 
(1), (2), (3), (4), (5), (6), (7), (8)
ON CONFLICT (number) DO NOTHING;
