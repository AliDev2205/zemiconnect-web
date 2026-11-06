'use client';

import { useState } from 'react';
import { Ban, Download, FileDown, QrCode as QrIcon, RefreshCw } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import QrBadge from '@/components/ui/QrBadge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import DataTable, { Column } from '@/components/ui/DataTable';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import { useQrCodes, useQrPreview, useRegenerateQr, useRevokeQr } from '@/hooks/queries/useQr';
import { toApiError } from '@/lib/api/errors';
import { qrService } from '@/lib/api/services/qr/qr';
import { PUBLIC_URL } from '@/lib/qr/parseQr';
import { toast } from '@/lib/toast/store';
import { formatDateTime } from '@/lib/utils/format';
import type { Driver } from '@/types/driver';
import type { QrCode, QrFileFormat } from '@/types/qr';
import DriverPhoto from '../DriverPhoto';

interface Props {
  driver: Driver;
  readOnly: boolean;
  // Arrivée après la validation : le téléchargement du badge est mis en avant.
  highlightBadge?: boolean;
}

const PUBLIC_DOMAIN = new URL(PUBLIC_URL).host;

export default function QrTab({ driver, readOnly, highlightBadge }: Props) {
  const codes = useQrCodes(driver.id);
  const active = codes.data?.find((code) => code.status === 'actif');
  const preview = useQrPreview(driver.id, active?.id);
  const [dialog, setDialog] = useState<null | 'regenerate' | 'revoke'>(null);
  const regenerate = useRegenerateQr(driver.id);
  const revoke = useRevokeQr(driver.id);
  const [downloading, setDownloading] = useState<QrFileFormat | null>(null);
  const name = `${driver.first_name} ${driver.last_name}`;

  // Fichiers produits par l'API (badge PDF, QR PNG ou SVG).
  const download = async (format: QrFileFormat) => {
    setDownloading(format);
    try {
      const blob = await qrService.file(driver.id, format);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = format === 'pdf' ? `badge-${driver.zc_number ?? driver.id}.pdf` : `qr-${driver.zc_number ?? driver.id}.${format}`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      toast.error(toApiError(error).message);
    } finally {
      setDownloading(null);
    }
  };

  const closeDialog = () => {
    regenerate.reset();
    revoke.reset();
    setDialog(null);
  };

  const columns: Column<QrCode>[] = [
    { key: 'issued', title: 'Généré le', render: (code) => <span className="tabular">{formatDateTime(code.issued_at)}</span> },
    { key: 'status', title: 'Statut', render: (code) => <QrBadge status={code.status} /> },
    { key: 'revoked', title: 'Révoqué le', render: (code) => (code.revoked_at ? <span className="tabular">{formatDateTime(code.revoked_at)}</span> : '—') },
    { key: 'reason', title: 'Motif', render: (code) => code.revoke_reason ?? '—' },
  ];

  if (driver.status === 'en_attente') {
    return (
      <Card padded={false}>
        <EmptyState icon={<QrIcon size={24} />} title="Pas encore de QR" message="Le numéro ZemiConnect et le QR sont générés à la validation du dossier." />
      </Card>
    );
  }

  if (codes.isError) {
    return (
      <Card padded={false}>
        <ErrorState message={toApiError(codes.error).message} onRetry={() => codes.refetch()} />
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {highlightBadge && active && (
        <Alert tone="success" title="Dossier validé">
          Le numéro {driver.zc_number} et le QR ont été générés. Téléchargez le badge pour l&apos;imprimer.
        </Alert>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="QR actif">
          {codes.isPending ? (
            <Skeleton className="mx-auto h-48 w-48" />
          ) : active ? (
            <div className="flex flex-col items-center gap-4">
              {preview.data ? (
                // eslint-disable-next-line @next/next/no-img-element -- image produite par l'API, servie en URL locale (blob:)
                <img src={preview.data} alt={`QR de ${name}`} className="h-48 w-48 rounded-field border border-border" />
              ) : (
                <Skeleton className="h-48 w-48" />
              )}
              <p className="text-sm text-muted">Généré le {formatDateTime(active.issued_at)}</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button size={highlightBadge ? 'lg' : 'md'} leftIcon={<FileDown size={18} />} onClick={() => download('pdf')} isLoading={downloading === 'pdf'}>
                  {highlightBadge ? 'Télécharger le badge' : 'Badge PDF'}
                </Button>
                <Button variant="outline" leftIcon={<Download size={16} />} onClick={() => download('png')} isLoading={downloading === 'png'}>
                  Télécharger PNG
                </Button>
                <Button variant="outline" leftIcon={<Download size={16} />} onClick={() => download('svg')} isLoading={downloading === 'svg'}>
                  Télécharger SVG
                </Button>
              </div>
              {!readOnly && (
                <div className="flex flex-wrap justify-center gap-2 border-t border-border pt-4">
                  <Button variant="outline" size="sm" leftIcon={<RefreshCw size={14} />} onClick={() => setDialog('regenerate')}>
                    Régénérer
                  </Button>
                  <Button variant="outline" size="sm" leftIcon={<Ban size={14} />} className="text-danger" onClick={() => setDialog('revoke')}>
                    Révoquer
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={<QrIcon size={24} />}
              title="Aucun QR actif"
              message={driver.status === 'archive' ? 'Le QR a été révoqué à l’archivage.' : 'Le QR a été révoqué : le badge ne fonctionne plus.'}
              action={
                !readOnly && (
                  <Button leftIcon={<RefreshCw size={16} />} onClick={() => setDialog('regenerate')}>
                    Générer un nouveau QR
                  </Button>
                )
              }
            />
          )}
        </Card>

        <Card title="Aperçu du badge">
          <div className="mx-auto w-full max-w-72 overflow-hidden rounded-card border border-border">
            <div className="bg-accent px-4 py-2 text-center text-sm font-bold tracking-wide text-foreground">ZemiConnect · Parakou</div>
            <div className="flex flex-col items-center gap-3 bg-surface p-4">
              <DriverPhoto url={driver.photo_url} name={name} size={112} />
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">{driver.last_name}</p>
                <p className="text-sm text-foreground">{driver.first_name}</p>
                <p className="tabular mt-1 text-base font-semibold text-primary">{driver.zc_number}</p>
              </div>
              {active && preview.data ? (
                // eslint-disable-next-line @next/next/no-img-element -- même image que le QR actif
                <img src={preview.data} alt="" className="h-28 w-28" />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded border border-dashed border-border text-xs text-muted">Pas de QR actif</div>
              )}
              <p className="text-xs text-muted">{PUBLIC_DOMAIN}</p>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-muted">Aperçu indicatif. Le badge à imprimer est le PDF produit par le serveur.</p>
        </Card>
      </div>

      <section aria-labelledby="historique-qr" className="flex flex-col gap-2">
        <h2 id="historique-qr" className="text-base font-semibold text-foreground">
          Historique des QR
        </h2>
        <DataTable columns={columns} data={codes.data ?? []} getRowKey={(code) => code.id} isLoading={codes.isPending} compact emptyTitle="Aucun QR" />
      </section>

      {!readOnly && (
        <>
          <ConfirmDialog
            open={dialog === 'regenerate'}
            onClose={closeDialog}
            title="Régénérer le QR ?"
            message={`Un nouveau QR sera émis pour ${name}. Il faudra réimprimer le badge.`}
            warning="L'ancien QR ne fonctionnera plus."
            confirmLabel="Régénérer le QR"
            tone="danger"
            requireReason
            reasonLabel="Motif de la régénération"
            isLoading={regenerate.isPending}
            error={regenerate.error}
            onConfirm={async (reason) => {
              try {
                await regenerate.mutateAsync({ reason: reason! });
                toast.success('Nouveau QR émis. L’ancien ne fonctionne plus.');
                setDialog(null);
              } catch {
                // Bandeau dans la modale.
              }
            }}
          />
          <ConfirmDialog
            open={dialog === 'revoke'}
            onClose={closeDialog}
            title="Révoquer le QR ?"
            message={`Le badge de ${name} affichera « QR non valide ». Aucun nouveau QR n'est émis.`}
            confirmLabel="Révoquer"
            tone="danger"
            requireReason
            reasonLabel="Motif de la révocation"
            isLoading={revoke.isPending}
            error={revoke.error}
            onConfirm={async (reason) => {
              try {
                await revoke.mutateAsync({ reason: reason! });
                toast.success('QR révoqué.');
                setDialog(null);
              } catch {
                // Bandeau dans la modale.
              }
            }}
          />
        </>
      )}
    </div>
  );
}
