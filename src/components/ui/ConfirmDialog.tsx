'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toApiError } from '@/lib/api/errors';
import Alert from './Alert';
import Button from './Button';
import { TextArea } from './Input';
import Modal from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  // Reçoit le motif saisi quand requireReason est vrai.
  onConfirm: (reason?: string) => void;
  title: string;
  message?: React.ReactNode;
  // Rappel mis en avant (« Le QR sera révoqué et l'affectation clôturée »).
  warning?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
  // Actions sensibles (suspension, archivage, QR) : motif obligatoire, journalisé.
  requireReason?: boolean;
  reasonLabel?: string;
  minReasonLength?: number;
  isLoading?: boolean;
  // Erreur de la dernière tentative : bandeau en haut de la modale, saisie
  // conservée ; une 422 sur `reason` s'affiche sous le champ.
  error?: unknown;
}

// Confirmation de toute action sensible. Le parent garde la modale ouverte
// en cas d'erreur et la ferme au succès.
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  warning,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  tone = 'primary',
  requireReason = false,
  reasonLabel = 'Motif',
  minReasonLength = 5,
  isLoading,
  error,
}: ConfirmDialogProps) {
  const schema = z.object({
    reason: requireReason
      ? z.string().trim().min(minReasonLength, `Le motif doit contenir au moins ${minReasonLength} caractères.`)
      : z.string().optional(),
  });
  type Values = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { reason: '' } });

  // Nouvelle ouverture : formulaire vide. Une erreur ne vide jamais la saisie.
  useEffect(() => {
    if (open) reset({ reason: '' });
  }, [open, reset]);

  const apiError = error ? toApiError(error) : null;
  const reasonError = apiError?.status === 422 ? apiError.errors?.reason?.[0] : undefined;

  useEffect(() => {
    if (reasonError) setError('reason', { type: 'server', message: reasonError });
  }, [reasonError, setError]);

  // Bandeau : toute erreur qui n'est pas portée par le champ du motif.
  const banner = apiError && !reasonError ? apiError.message : null;

  const submit = handleSubmit((values) => onConfirm(requireReason ? values.reason?.trim() : undefined));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="md"
      dismissible={!isLoading}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={submit} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        {banner && <Alert tone="danger">{banner}</Alert>}
        {message && <div className="text-sm text-foreground">{message}</div>}
        {warning && <Alert tone="warning">{warning}</Alert>}
        {requireReason && (
          <TextArea label={reasonLabel} required rows={3} error={errors.reason?.message} disabled={isLoading} {...register('reason')} />
        )}
      </form>
    </Modal>
  );
}
