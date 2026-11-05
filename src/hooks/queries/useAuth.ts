import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  authService,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  ResetPasswordPayload,
} from '@/lib/api/services/auth/auth';
import { clearRoleHint, setRoleHint } from '@/lib/auth/session';
import { getHomeRouteForRole } from '@/lib/constants';
import { can, Permission } from '@/lib/permissions';
import { authKeys } from '@/lib/query/keys';

// Source de vérité de l'utilisateur connecté (nav, garde, permissions).
// Le cache étant partagé par clé, un seul appel réseau pour toute la page.
export function useMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: authService.me,
    staleTime: 5 * 60 * 1000,
  });
}

// can(permission) à partir de /auth/me. Affichage uniquement : l'API tranche (403).
export function useCan() {
  const { data } = useMe();
  return (permission: Permission) => can(data, permission);
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    // Le formulaire affiche ses erreurs en ligne (applyApiErrorsToForm).
    meta: { toast: false },
    onSuccess: (me) => {
      setRoleHint(me.user.role);
      queryClient.setQueryData(authKeys.me, me);
      router.replace(me.user.must_change_password ? '/changer-mot-de-passe' : getHomeRouteForRole(me.user.role));
    },
  });
}

// Nettoyage local dans onSettled : l'utilisateur est déconnecté côté client
// même si l'appel serveur échoue.
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authService.logout(),
    meta: { toast: false },
    onSettled: () => {
      clearRoleHint();
      queryClient.clear();
      router.replace('/connexion');
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => authService.forgotPassword(payload),
    meta: { toast: { success: 'Si ce compte existe, un e-mail de réinitialisation a été envoyé.' } },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authService.resetPassword(payload),
    meta: { toast: { success: 'Mot de passe réinitialisé. Vous pouvez vous connecter.' } },
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => authService.changePassword(payload),
    meta: { toast: { success: 'Mot de passe modifié.' } },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authKeys.me }),
  });
}
