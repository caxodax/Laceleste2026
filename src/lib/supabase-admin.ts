import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ttglahstbeogwzqlmhkj.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('--- Supabase Admin Client Init ---');
console.log('URL:', supabaseUrl);
console.log('Key defined:', !!supabaseServiceKey);
if (supabaseServiceKey) {
  console.log('Key start:', supabaseServiceKey.substring(0, 10));
}
console.log('-----------------------------------');

// Cliente con privilegios de administrador (solo para uso en el servidor)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
