'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Drawer from '@/components/ui/Drawer';
import { useUpdateDriver } from '@/hooks/queries/useDrivers';
import { toast } from '@/lib/toast/store';
import { formatDate, formatDateTime } from '@/lib/utils/format';
import type { Driver } from '@/types/driver';
import IdentityForm from '../forms/IdentityForm';
import PhotoEditor from '../photo/PhotoEditor';

interface Props {
  driver: Driver;
  readOnly: boolean;
  basePath: string;
}

export default function IdentityTab({ driver, readOnly, basePath }: Props) {
  const [editing, setEditing] = useState(false);
  const update = useUpdateDriver(driver.id);
  const rows: [string, React.ReactNode][] = [
    ['Nom', driver.last_name],
    ['Prénom', driver.first_name],
    ['Date de naissance', formatDate(driver.birth_date)],
    ['Téléphone', <span key="phone" className="tabular">{driver.phone ?? '—'}</span>],
    ['Adresse', driver.address ?? '—'],
    ['Identifiant du conducteur', driver.driver_identifier ?? 'Non renseigné'],
    ['Fiche papier', driver.has_paper_form ? 'Scan enregistré' : 'Aucun scan'],
    ['Structure gestionnaire', driver.managing_structure ?? 'Non renseignée'],
    ['Enregistré le', formatDateTime(driver.created_at)],
    ['Validé le', driver.validated_at ? formatDateTime(driver.validated_at) : 'Pas encore validé'],
  ];

  return (
    <Card
      title="Identité"
      actions={
        !readOnly && (
          <Button variant="outline" size="sm" leftIcon={<Pencil size={14} />} onClick={() => setEditing(true)}>
            Modifier
          </Button>
        )
      }
    >
      <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-0.5">
            <dt className="text-xs font-semibold text-muted uppercase">{label}</dt>
            <dd className="text-sm text-foreground">{value}</dd>
          </div>
        ))}
      </dl>

      {!readOnly && (
        <Drawer
          open={editing}
          onClose={() => setEditing(false)}
          title="Modifier l'identité"
          description={`${driver.first_name} ${driver.last_name}`}
          width={640}
          footer={
            <>
              <Button variant="outline" onClick={() => setEditing(false)} disabled={update.isPending}>
                Annuler
              </Button>
              <Button type="submit" form="identity-edit" isLoading={update.isPending}>
                Enregistrer les modifications
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-6">
            <section aria-label="Photo" className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-foreground">Photo</h3>
              <PhotoEditor driverId={driver.id} name={`${driver.first_name} ${driver.last_name}`} currentUrl={driver.photo_url} onSaved={() => toast.success('Photo enregistrée.')} />
            </section>
            <IdentityForm
              formId="identity-edit"
              driver={driver}
              driversPath={basePath}
              onSubmit={async (payload, paperForm) => {
                await update.mutateAsync({ payload, paperForm });
                toast.success('Identité mise à jour.');
                setEditing(false);
              }}
            />
          </div>
        </Drawer>
      )}
    </Card>
  );
}
