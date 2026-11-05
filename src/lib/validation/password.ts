import { z } from 'zod';

/*
 * Règles du mot de passe : UNE seule source, réutilisée par AU3
 * (réinitialisation), AU4 (changement obligatoire) et les profils.
 * Proposition technique (10 caractères, une lettre, un chiffre) : à ajuster
 * ici si l'API retient d'autres règles, l'affichage suit automatiquement.
 */
export const PASSWORD_RULES = [
  { id: 'length', label: 'Au moins 10 caractères', test: (value: string) => value.length >= 10 },
  { id: 'letter', label: 'Au moins une lettre', test: (value: string) => /\p{L}/u.test(value) },
  { id: 'digit', label: 'Au moins un chiffre', test: (value: string) => /\d/.test(value) },
] as const;

// Une erreur par règle non respectée ; le champ affiche la première.
export const passwordSchema = z.string().superRefine((value, ctx) => {
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(value)) ctx.addIssue({ code: 'custom', message: `Mot de passe trop faible : ${rule.label.toLowerCase()}.` });
  }
});

const confirmationSchema = z.string().min(1, 'Confirmez le nouveau mot de passe.');

const matches = (data: { password: string; password_confirmation: string }) => data.password === data.password_confirmation;
const mismatch = { message: 'Les deux mots de passe ne correspondent pas.', path: ['password_confirmation'] };

// AU3 : nouveau mot de passe + confirmation.
export const newPasswordSchema = z
  .object({ password: passwordSchema, password_confirmation: confirmationSchema })
  .refine(matches, mismatch);

// AU4 et profils : mot de passe actuel (ou provisoire) + nouveau + confirmation.
export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Saisissez votre mot de passe actuel.'),
    password: passwordSchema,
    password_confirmation: confirmationSchema,
  })
  .refine(matches, mismatch);

export type NewPasswordValues = z.infer<typeof newPasswordSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
