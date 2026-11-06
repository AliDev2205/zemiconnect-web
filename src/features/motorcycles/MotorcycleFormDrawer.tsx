'use client';

import { useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Drawer from '@/components/ui/Drawer';
import { useCreateMotorcycle, useUpdateMotorcycle } from '@/hooks/queries/useMotorcycles';
import { formErrorBanner } from '@/lib/api/errors';
import { toast } from '@/lib/toast/store';
import type { Motorcycle } from '@/types/motorcycle';
import MotorcycleFields, { toMotorcyclePayload, useMotorcycleForm } from './MotorcycleFields';

interface Props {
  open: boolean;
  onClose: () => void;
  // Absente : création (« Nouvelle moto ») ; présente : modification.
  moto?: Motorcycle | null;
  onSaved?: (moto: Motorcycle) => void;
}

// Drawer « Nouvelle moto » (GE5) et « Modifier » (GE6). Monté à l'ouverture
// seulement : chaque ouverture repart des valeurs de la moto.
export default function MotorcycleFormDrawer(props: Props) {
  return props.open ? <DrawerContent {...props} /> : null;
}

function DrawerContent({ onClose, moto, onSaved }: Props) {
  const create = useCreateMotorcycle();
  const update = useUpdateMotorcycle(moto?.id ?? '');
  const [banner, setBanner] = useState<string | null>(null);
  const { register, handleSubmit, setError, formState } = useMotorcycleForm(moto);
  const busy = create.isPending || update.isPending;

  const submit = handleSubmit(async (values) => {
    setBanner(null);
    try {
      const saved = moto ? await update.mutateAsync(toMotorcyclePayload(values)) : await create.mutateAsync(toMotorcyclePayload(values));
      toast.success(moto ? 'Moto modifiée.' : `Moto ${saved.plate_number} enregistrée.`);
      onSaved?.(saved);
      onClose();
    } catch (error) {
      setBanner(formErrorBanner(error, setError));
    }
  });

  return (
    <Drawer
      open
      onClose={onClose}
      title={moto ? 'Modifier la moto' : 'Nouvelle moto'}
      description={moto?.plate_number}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Annuler
          </Button>
          <Button type="submit" form="motorcycle-form" isLoading={busy}>
            Enregistrer
          </Button>
        </>
      }
    >
      <form id="motorcycle-form" onSubmit={submit} noValidate>
        <fieldset disabled={busy} className="flex flex-col gap-4">
          {banner && <Alert tone="danger">{banner}</Alert>}
          <MotorcycleFields register={register} errors={formState.errors} />
          {!moto && <p className="text-sm text-muted">L&apos;assurance s&apos;ajoute ensuite depuis la fiche de la moto.</p>}
        </fieldset>
      </form>
    </Drawer>
  );
}
