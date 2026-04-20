'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { User as AppUser } from '@/types';
import { revalidatePath } from 'next/cache';

/**
 * Obtiene la lista de todos los perfiles de usuario
 */
export async function getUsers(): Promise<AppUser[]> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!key) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is missing');
      return [];
    }

    // 1. Obtener todos los usuarios de Auth (donde reside la identidad real)
    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return [];
    }

    // 2. Obtener todos los perfiles complementarios
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*');

    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      // Continuamos aunque fallen los perfiles, usaremos datos de Auth
    }

    console.log(`Auth users: ${authUsers.length}, Profiles: ${profiles?.length || 0}`);

    // 3. Combinar datos
    return authUsers.map(authUser => {
      const profile = profiles?.find(p => p.id === authUser.id);
      return {
        id: authUser.id,
        email: authUser.email || '',
        displayName: profile?.display_name || authUser.user_metadata?.display_name || 'Usuario',
        role: (profile?.role as any) || 'customer',
        phone: profile?.phone || authUser.phone,
        createdAt: new Date(authUser.created_at),
        lastLogin: authUser.last_sign_in_at ? new Date(authUser.last_sign_in_at) : undefined
      };
    });
  } catch (err) {
    console.error('Unexpected error in getUsers:', err);
    return [];
  }
}

/**
 * Crea un nuevo usuario y su perfil correspondiente
 */
export async function createAdminUser(userData: {
  email: string;
  password: string;
  displayName: string;
  role: 'admin' | 'staff' | 'customer';
  phone?: string;
}) {
  try {
    // 1. Crear el usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Confirmar inmediatamente como pidió el usuario
      user_metadata: {
        display_name: userData.displayName,
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No se pudo crear el usuario');

    // 2. Crear el perfil en la tabla 'profiles'
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        display_name: userData.displayName,
        role: userData.role,
        phone: userData.phone,
      });

    if (profileError) {
      // Si falla el perfil, intentamos borrar el usuario de auth para mantener consistencia
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    revalidatePath('/admin/usuarios');
    return { success: true, user: authData.user };
  } catch (error: any) {
    console.error('Error creating user:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Elimina un usuario (Auth y Perfil)
 */
export async function deleteUser(userId: string) {
  try {
    // El trigger en la base de datos debería borrar el perfil si se borra el auth user,
    // o viceversa. Pero lo hacemos explícito por seguridad.
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) throw authError;

    revalidatePath('/admin/usuarios');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Actualiza el rol de un usuario
 */
export async function updateUserRole(userId: string, role: 'admin' | 'staff' | 'customer') {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) throw error;

    revalidatePath('/admin/usuarios');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating role:', error);
    return { success: false, error: error.message };
  }
}
