'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Logo, Button, Input, Card, CardContent } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, loading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await signIn(email, password);
      toast.success('¡Bienvenido!');
      router.push('/admin');
    } catch (err) {
      toast.error('Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-celeste-600 via-celeste-500 to-celeste-700 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gold-400/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="shadow-premium">
          <CardContent className="p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <Logo size="lg" className="justify-center" />
              <p className="text-gray-500 mt-2">Panel de Administración</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email"
                type="email"
                placeholder="admin@laceleste.com"
                icon={<Mail className="w-5 h-5" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="relative">
                <Input
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  icon={<Lock className="w-5 h-5" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" variant="primary" fullWidth loading={loading}>
                Iniciar Sesión
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-celeste-50 rounded-lg">
              <p className="text-sm text-celeste-700 font-medium mb-2">
                🔐 Credenciales de prueba:
              </p>
              <p className="text-xs text-celeste-600">
                Email: admin@laceleste.com<br />
                Password: admin123
              </p>
            </div>

            {/* Back link */}
            <div className="mt-6 text-center">
              <a href="/" className="text-sm text-gray-500 hover:text-celeste-600 transition-colors">
                ← Volver al sitio
              </a>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
