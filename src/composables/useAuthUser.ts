/**
 * Simple Auth User Composable
 * Composable ligero para obtener solo el usuario autenticado
 */

import { useAuth } from './useAuth';

/**
 * Wrapper simple del usuario autenticado para uso en otros composables
 */
export function useAuthUser() {
  const { user, isAuthenticated, loading } = useAuth();

  return {
    user,
    isAuthenticated,
    loading
  };
}