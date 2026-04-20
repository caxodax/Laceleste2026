-- Schema for La Celeste Web (Supabase/PostgreSQL)

-- 1. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category_id TEXT REFERENCES categories(id),
  image_url TEXT,
  available BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  delivery_address TEXT,
  delivery_type TEXT NOT NULL, -- 'pickup' | 'delivery'
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INVOICES
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  order_id UUID REFERENCES orders(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_address TEXT,
  customer_rif TEXT,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_reference TEXT,
  status TEXT DEFAULT 'draft', -- 'draft' | 'issued' | 'paid' | 'cancelled'
  notes TEXT,
  issued_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PROFILES (Extending Auth Users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role TEXT DEFAULT 'customer', -- 'admin' | 'staff' | 'customer'
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SETTINGS
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEED DATA (from menu.ts)

-- Categories
INSERT INTO categories (id, name, description, icon, order_index, active) VALUES
('hamburguesas', 'Hamburguesas', 'Nuestras deliciosas hamburguesas artesanales', '🍔', 1, TRUE),
('tequenos', 'Tequeños', 'Crujientes tequeños venezolanos', '🧀', 2, TRUE),
('bebidas', 'Bebidas', 'Refrescos y bebidas', '🥤', 3, TRUE),
('postres', 'Postres', 'Dulces tentaciones', '🍰', 4, TRUE),
('combos', 'Combos y Promos', 'Las mejores promociones', '⭐', 5, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Products
INSERT INTO products (id, name, description, price, category_id, image_url, available, featured, order_index) VALUES
('san-telmo', 'San Telmo', 'Pan de papa, 100gr medallón de solomo, cheddar, tocineta, cebolla caramelizada y BBQ', 8.50, 'hamburguesas', '/images/burgers/san-telmo.jpg', TRUE, TRUE, 1),
('palermo', 'Palermo', 'Pan de papa, 100gr por medallón de solomo, cheddar, tocineta, pepinillo y salsa alioli', 8.50, 'hamburguesas', '/images/burgers/palermo.jpg', TRUE, TRUE, 2),
('caballito', 'Caballito', 'Pan de papa, 100gr por medallón de solomo, cheddar, lechuga, pepinillo, cebolla y salsa big mac', 8.00, 'hamburguesas', '/images/burgers/caballito.jpg', TRUE, TRUE, 3),
('recoleta', 'Recoleta', 'Pan de papa, 100gr por medallón de solomo, cheddar, tocineta, cebolla crispy y salsa alioli', 8.50, 'hamburguesas', '/images/burgers/recoleta.jpg', TRUE, FALSE, 4),
('belgrano', 'Belgrano', 'Pan de papa, pollo crispy, cheddar, tocineta, coleslaw y honey mustard', 8.50, 'hamburguesas', '/images/burgers/belgrano.jpg', TRUE, FALSE, 5),
('mardel', 'Mardel', 'Pan de papa, 110gr por medallón de solomo, cheddar, tocineta, tomate, lechuga y salsa bahía', 9.00, 'hamburguesas', '/images/burgers/mardel.jpg', TRUE, FALSE, 6),
('la-monumental', 'La Monumental', 'Pan de papa, 100gr medallón de solomo, 100g de pollo crispy, cheddar, cebolla caramelizada, salsa bahía', 10.00, 'hamburguesas', '/images/burgers/la-monumental.jpg', TRUE, TRUE, 7),
('la-bombonera', 'La Bombonera', 'Pan de papa, 100gr medallón de solomo, cheddar, cebolla en brunoise, pepinillos, ketchup, mostaza + papas fritas', 9.50, 'hamburguesas', '/images/burgers/la-bombonera.jpg', TRUE, TRUE, 8),
('matadero', 'Matadero', 'Pan brioche, 100gr de pollo crispy, cheddar, lechuga, tomate y salsa a elección', 8.00, 'hamburguesas', '/images/burgers/matadero.jpg', TRUE, FALSE, 9),
('carlotta', 'Carlotta', 'Pan de papa, 100gr por medallón de solomo, cheddar, lechuga, tomate y salsa a elección', 7.50, 'hamburguesas', '/images/burgers/carlotta.jpg', TRUE, FALSE, 10),
('tequenos-10', 'Tequeños Ración 10 unidades', 'Deliciosos tequeños de queso, ración completa de 10 unidades', 5.00, 'tequenos', '/images/tequenos.jpg', TRUE, TRUE, 1),
('tequenos-5', 'Tequeños 1/2 Ración 5 unidades', 'Media ración de tequeños de queso, 5 unidades', 3.00, 'tequenos', '/images/tequenos.jpg', TRUE, FALSE, 2),
('refresco-355', 'Refresco 355ml', 'Refresco de lata 355ml', 1.50, 'bebidas', '/images/drinks/refresco.jpg', TRUE, FALSE, 1),
('refresco-1l', 'Refresco 1L', 'Refresco de botella 1 litro', 2.50, 'bebidas', '/images/drinks/refresco-1l.jpg', TRUE, FALSE, 2),
('tevia-360', 'Tevia 360ml', 'Té Tevia 360ml', 1.50, 'bebidas', '/images/drinks/tevia.jpg', TRUE, FALSE, 3),
('agua-mineral-600', 'Agua Mineral 600ml', 'Agua mineral 600ml', 1.00, 'bebidas', '/images/drinks/agua.jpg', TRUE, FALSE, 4),
('agua-gasificada-355', 'Agua Gasificada 355ml', 'Agua gasificada 355ml', 1.50, 'bebidas', '/images/drinks/agua-gas.jpg', TRUE, FALSE, 5),
('brookies', 'Brookies', 'Deliciosa combinación de brownie y cookie', 3.00, 'postres', '/images/desserts/brookies.jpg', TRUE, TRUE, 1),
('alfajor-tradicional', 'Alfajor Tradicional', 'Alfajor tradicional con dulce de leche', 2.50, 'postres', '/images/desserts/alfajor.jpg', TRUE, FALSE, 2),
('alfajor-chocolate', 'Alfajor Bañado en Chocolate', 'Alfajor bañado en chocolate con dulce de leche', 3.00, 'postres', '/images/desserts/alfajor-chocolate.jpg', TRUE, FALSE, 3),
('promo-4-hamburguesas', 'Promo 4 Hamburguesas', '100gr medallón de solomo, cheddar, lechuga, tomate, salsa a elección + papas fritas + refresco de 1L', 28.00, 'combos', '/images/combos/promo-4.jpg', TRUE, TRUE, 1),
('menu-kids', 'Menú Kids', '150gr de milanesitas de pollo + 100gr de papas fritas y salsa a elección', 6.00, 'combos', '/images/combos/menu-kids.jpg', TRUE, FALSE, 2)
ON CONFLICT (id) DO NOTHING;

-- Settings
INSERT INTO settings (key, value) VALUES
('restaurant_info', '{
  "name": "La Celeste",
  "phone": "0424-5645357",
  "whatsapp": "584245645357",
  "email": "lacelestebqto@gmail.com",
  "address": "Barquisimeto, Venezuela",
  "instagram": "@lacelestebqto",
  "taxRate": 0.16,
  "deliveryFee": 2.00,
  "minOrderDelivery": 10.00,
  "currency": "USD",
  "currencySymbol": "$"
}'::jsonb),
('payment_methods', '[
  {"id": "zelle", "name": "Zelle", "type": "zelle", "details": "BofA 2244418858", "active": true},
  {"id": "binance", "name": "Binance", "type": "binance", "details": "Antoniocarpentierilecce@gmail.com", "active": true},
  {"id": "pago-movil", "name": "Pago Móvil", "type": "pago_movil", "details": "V-24.159.676 | 0412 122 7176 | Banesco", "active": true},
  {"id": "efectivo", "name": "Efectivo", "type": "cash", "details": "Pago al recibir", "active": true}
]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- RLS POLICIES (Simplificado)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (active = TRUE);
CREATE POLICY "Public read products" ON products FOR SELECT USING (available = TRUE);
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (TRUE);

-- Auth access
CREATE POLICY "Users can read their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can do everything on products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
-- ... Mas políticas pueden ser agregadas según sea necesario.
