import { createClient } from '@supabase/supabase-js';

// DIAGNOSTIC LOG - If you see 'supabse' (no 'a') in the browser console, 
// then the browser is serving a cached version of this file.
const supabaseUrl = 'https://ttglahstbeogwzqlmhkj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0Z2xhaHN0YmVvZ3d6cWxtaGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NDU3OTMsImV4cCI6MjA5MjAyMTc5M30.DmJX-8lX12P43gtsEZDBRvom2JfakD1zTjGIKOr4eXE';

if (typeof window !== 'undefined') {
  console.log('%c SUPABASE URL CONECTANDO:', 'background: #0ea5e9; color: white; padding: 4px 8px; border-radius: 4px;', supabaseUrl);
}

const projectRef = 'ttglahstbeogwzqlmhkj';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: `sb-${projectRef}-auth-token`,
  }
});
