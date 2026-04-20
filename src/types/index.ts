// Tipos principales de la aplicación

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  thumbnail?: string;
  available: boolean;
  featured?: boolean;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  order: number;
  active: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress?: string;
  deliveryType: 'pickup' | 'delivery';
  paymentMethod: 'cash' | 'zelle' | 'binance' | 'pago_movil' | 'transfer';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  order: Order;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  customerRif?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentReference?: string;
  status: 'draft' | 'issued' | 'paid' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  issuedAt?: Date;
  paidAt?: Date;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'staff' | 'customer';
  phone?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface RestaurantSettings {
  name: string;
  logo?: string;
  phone: string;
  whatsapp: string;
  email?: string;
  address: string;
  instagram: string;
  schedule: {
    [key: string]: { open: string; close: string; closed?: boolean };
  };
  taxRate: number;
  deliveryFee: number;
  minOrderDelivery: number;
  paymentMethods: PaymentMethod[];
  currency: string;
  currencySymbol: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'cash' | 'zelle' | 'binance' | 'pago_movil' | 'transfer';
  details: string;
  icon?: string;
  active: boolean;
}

// Estados del carrito
export interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

// Estados de autenticación
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
}
