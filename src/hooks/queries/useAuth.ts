import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  authService,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  ProfilePayload,
  ResetPasswordPayload,
} from '@/lib/api/services/auth/auth';
import { getPostLoginRoute } from '@/lib/auth/redirect';
import { clearSessionHints, setPasswordChangeHint, setSessionHints } from '@/lib/auth/session';
import { can, Permission } from '@/lib/permissions';
import { authKeys } from '@/lib/query/keys';
import { toast } from '@/lib/toast/store';

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

// `retour` : chemin demandé avant la connexion, validé par getPostLoginRoute
// (interne et dans l'espace du rôle, sinon ignoré).
export function useLogin({ retour }: { retour?: string | null } = {}) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    // Le formulaire affiche ses erreurs en ligne.
    meta: { toast: false },
    onSuccess: (me, payload) => {
      setSessionHints(me, payload.remember);
      queryClient.setQueryData(authKeys.me, me);
      router.replace(getPostLoginRoute(me.user.role, me.user.must_change_password, retour));
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
      clearSessionHints();
      queryClient.clear();
      router.replace('/connexion');
    },
  });
}

// AU2 et AU3 affichent leur résultat dans la page : pas de toast.
export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => authService.forgotPassword(payload),
    meta: { toast: false },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authService.resetPassword(payload),
    meta: { toast: false },
  });
}

// AG5 et profils : nom, prénom, téléphone. Met à jour /auth/me en cache.
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProfilePayload) => authService.updateProfile(payload),
    // Les erreurs 422 sont reportées sur les champs ; le succès passe par un toast.
    meta: { toast: false },
    onSuccess: (me) => {
      queryClient.setQueryData(authKeys.me, me);
      toast.success('Profil enregistré.');
    },
  });
}

// Utilisé par AU4 et, plus tard, par les profils. Recharge /auth/me pour que
// must_change_password retombe à false partout (garde, proxy).
export function useChangePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => authService.changePassword(payload),
    // Erreurs affichées dans le formulaire : seul le succès passe par un toast.
    meta: { toast: false },
    onSuccess: async () => {
      toast.success('Mot de passe modifié.');
      setPasswordChangeHint(false);
      await queryClient.invalidateQueries({ queryKey: authKeys.me });
    },
  });
}
