import { boot } from 'quasar/wrappers';
import { supabase } from '../services/supabase/client';

export default boot(async ({ app }) => {
  // Make Supabase available globally
  app.config.globalProperties.$supabase = supabase;
  app.provide('supabase', supabase);

  // Initialize auth session
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log('✅ Supabase: Usuario autenticado', session.user.email);
    } else {
      console.log('ℹ️ Supabase: No hay sesión activa');
    }
  } catch (error) {
    console.error('❌ Supabase: Error al obtener sesión', error);
  }
});

// TypeScript augmentation for global properties
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $supabase: typeof supabase;
  }
}