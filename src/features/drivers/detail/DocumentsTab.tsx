'use client';

import { useState } from 'react';
import { ExternalLink, FilePlus2, RefreshCw } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import ValidityPill from '@/components/ui/ValidityPill';
import { useDocumentHistory, useUploadDocument } from '@/hooks/queries/useDocuments';
import { toApiError } from '@/lib/api/errors';
import { documentsService } from '@/lib/api/services/documents/documents';
import { toast } from '@/lib/toast/store';
import { formatDate } from '@/lib/utils/format';
import { DOCUMENT_FULL_LABELS } from '@/lib/utils/labels';
import type { Document, DocumentType } from '@/types/document';
import type { Driver } from '@/types/driver';
import DocumentForm from '../forms/DocumentForm';

const TYPES: DocumentType[] = ['permis', 'droit_taxi', 'piece_identite', 'assurance'];

interface Props {
  driver: Driver;
  readOnly: boolean;
}

// Une carte par type : permis, droit de taxi, pièce d'identité, assurance de
// la moto actuelle. L'historique (documents remplacés) est replié par type.
export default function DocumentsTab({ driver, readOnly }: Props) {
  const [editing, setEditing] = useState<DocumentType | null>(null);
  const moto = driver.motorcycle;
  const driverHistory = useDocumentHistory({ type: 'driver', id: driver.id });
  const motoHistory = useDocumentHistory({ type: 'motorcycle', id: moto?.id ?? '' });

  const current = (type: DocumentType) => (type === 'assurance' ? moto?.documents : driver.documents)?.find((document) => document.type === type) ?? null;
  const history = (type: DocumentType) => ((type === 'assurance' ? motoHistory.data : driverHistory.data) ?? []).filter((document) => document.type === type);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {TYPES.map((type) => (
        <DocumentCard
          key={type}
          type={type}
          document={current(type)}
          history={history(type)}
          historyLoading={type === 'assurance' ? !!moto && motoHistory.isPending : driverHistory.isPending}
          noMotorcycle={type === 'assurance' && !moto}
          readOnly={readOnly}
          onEdit={() => setEditing(type)}
        />
      ))}
      {!readOnly && editing && (
        <DocumentModal
          type={editing}
          owner={editing === 'assurance' ? { type: 'motorcycle', id: moto!.id } : { type: 'driver', id: driver.id }}
          current={current(editing)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function DocumentCard({
  type,
  document,
  history,
  historyLoading,
  noMotorcycle,
  readOnly,
  onEdit,
}: {
  type: DocumentType;
  document: Document | null;
  history: Document[];
  historyLoading: boolean;
  noMotorcycle: boolean;
  readOnly: boolean;
  onEdit: () => void;
}) {
  return (
    <section aria-labelledby={`doc-${type}`} className="flex flex-col gap-3 rounded-card border border-border bg-surface p-5">
      <header className="flex items-start justify-between gap-2">
        <h3 id={`doc-${type}`} className="text-base font-semibold text-foreground">
          {DOCUMENT_FULL_LABELS[type]}
        </h3>
        <ValidityPill validity={document?.validity ?? 'manquant'} />
      </header>

      {noMotorcycle ? (
        <p className="text-sm text-muted">Aucune moto affectée : l&apos;assurance se rattache à la moto.</p>
      ) : document ? (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-muted">Numéro</dt>
          <dd className="tabular font-semibold">{document.number ?? '—'}</dd>
          <dt className="text-muted">Délivré le</dt>
          <dd>{formatDate(document.issued_at)}</dd>
          <dt className="text-muted">Expire le</dt>
          <dd>{document.expires_at ? formatDate(document.expires_at) : 'Sans date d’expiration'}</dd>
        </dl>
      ) : (
        <p className="text-sm text-muted">Aucun document enregistré.</p>
      )}

      <div className="flex flex-wrap gap-2">
        {document?.has_file && <ViewFileButton documentId={document.id} />}
        {!readOnly && !noMotorcycle && (
          <Button variant={document ? 'outline' : 'primary'} size="sm" leftIcon={document ? <RefreshCw size={14} /> : <FilePlus2 size={14} />} onClick={onEdit}>
            {document ? 'Renouveler' : 'Ajouter'}
          </Button>
        )}
      </div>

      <details className="group border-t border-border pt-3 text-sm">
        <summary className="cursor-pointer font-medium text-primary">Historique{historyLoading ? '' : ` (${history.length})`}</summary>
        {historyLoading ? (
          <Skeleton className="mt-2 h-8 w-full" />
        ) : history.length === 0 ? (
          <p className="mt-2 text-muted">Aucun document antérieur.</p>
        ) : (
          <ul className="mt-2 flex flex-col divide-y divide-border">
            {history.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>
                  <span className="tabular font-semibold">{item.number ?? '—'}</span>
                  <span className="text-muted"> · {item.expires_at ? `expirait le ${formatDate(item.expires_at)}` : 'sans date d’expiration'}</span>
                </span>
                <span className="text-xs text-muted">remplacé le {formatDate(item.superseded_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </details>
    </section>
  );
}

// Ouvre le fichier dans un nouvel onglet, par une URL TEMPORAIRE demandée à
// l'API au moment du clic (jamais de chemin public permanent dans la page).
function ViewFileButton({ documentId }: { documentId: string }) {
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

function DocumentModal({ type, owner, current, onClose }: { type: DocumentType; owner: { type: 'driver' | 'motorcycle'; id: string }; current: Document | null; onClose: () => void }) {
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
