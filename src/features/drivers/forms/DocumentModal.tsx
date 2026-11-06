'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useUploadDocument } from '@/hooks/queries/useDocuments';
import { toApiError } from '@/lib/api/errors';
import { documentsService } from '@/lib/api/services/documents/documents';
import { toast } from '@/lib/toast/store';
import { DOCUMENT_FULL_LABELS } from '@/lib/utils/labels';
import type { Document, DocumentType } from '@/types/document';
import DocumentForm from './DocumentForm';

// Ouvre le fichier dans un nouvel onglet, par une URL TEMPORAIRE demandée à
// l'API au moment du clic (jamais de chemin public permanent dans la page).
export function ViewFileButton({ documentId }: { documentId: string }) {
  const [loading, setLoading] = useState(false);
  const open = async () => {
    // Onglet ouvert tout de suite (sinon bloqué comme fenêtre surgissante), rempli ensuite.
    const tab = window.open('', '_blank');
    setLoading(true);
    try {
      const { url } = await documentsService.fileLink(documentId);
      if (tab) {
        tab.opener = null;
        tab.location.href = url;
      } else window.open(url, '_blank', 'noopener');
    } catch (error) {
      tab?.close();
      toast.error(toApiError(error).message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button variant="outline" size="sm" leftIcon={<ExternalLink size={14} />} onClick={open} isLoading={loading}>
      Voir le fichier
    </Button>
  );
}

export function DocumentModal({ type, owner, current, onClose }: { type: DocumentType; owner: { type: 'driver' | 'motorcycle'; id: string }; current: Document | null; onClose: () => void }) {
  const upload = useUploadDocument(owner);
  const formId = `document-${type}`;
  return (
    <Modal
      open
      onClose={onClose}
      title={`${current ? 'Renouveler' : 'Ajouter'} : ${DOCUMENT_FULL_LABELS[type]}`}
      dismissible={!upload.isPending}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={upload.isPending}>
            Annuler
          </Button>
          <Button type="submit" form={formId} isLoading={upload.isPending}>
            Enregistrer
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {current && (
          <Alert tone="info">
            Le document actuel ({current.number ?? 'sans numéro'}) passera dans l&apos;historique.
          </Alert>
        )}
        <DocumentForm
          formId={formId}
          type={type}
          current={current}
          onSubmit={async (payload) => {
            await upload.mutateAsync(payload);
            toast.success(`${DOCUMENT_FULL_LABELS[type]} enregistré${type === 'piece_identite' || type === 'assurance' ? 'e' : ''}.`);
            onClose();
          }}
        />
      </div>
    </Modal>
  );
}
