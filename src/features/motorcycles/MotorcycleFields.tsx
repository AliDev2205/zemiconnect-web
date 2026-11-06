'use client';

import { FieldErrors, useForm, UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextInput } from '@/components/ui/Input';
import type { Motorcycle, MotorcyclePayload } from '@/types/motorcycle';

const thisYear = new Date().getFullYear();

export const motorcycleSchema = z.object({
  plate_number: z.string().trim().min(1, "Saisissez l'immatriculation.").max(20, '20 caractères au plus.'),
  brand: z.string().trim().min(1, 'Saisissez la marque.').max(40, '40 caractères au plus.'),
  model: z.string().trim().max(60, '60 caractères au plus.'),
  color: z.string().trim().max(30, '30 caractères au plus.'),
  year: z
    .string()
    .trim()
    .refine((value) => value === '' || (/^\d{4}$/.test(value) && Number(value) >= 1980 && Number(value) <= thisYear + 1), `Année entre 1980 et ${thisYear + 1}.`),
  chassis_number: z.string().trim().max(40, '40 caractères au plus.'),
});
export type MotorcycleInput = z.input<typeof motorcycleSchema>;

export const toMotorcyclePayload = (values: MotorcycleInput): MotorcyclePayload => ({
  plate_number: values.plate_number.trim().toUpperCase(),
  brand: values.brand.trim(),
  model: values.model.trim() || null,
  color: values.color.trim() || null,
  year: values.year ? Number(values.year) : null,
  chassis_number: values.chassis_number.trim().toUpperCase() || null,
});

// Formulaire moto (création ou modification), partagé par le choix de moto
// (GE3, GE4), le Drawer « Nouvelle moto » (GE5) et « Modifier » (GE6).
export function useMotorcycleForm(moto?: Motorcycle | null) {
  return useForm<MotorcycleInput>({
    resolver: zodResolver(motorcycleSchema),
    defaultValues: {
      plate_number: moto?.plate_number ?? '',
      brand: moto?.brand ?? '',
      model: moto?.model ?? '',
      color: moto?.color ?? '',
      year: moto?.year ? String(moto.year) : '',
      chassis_number: moto?.chassis_number ?? '',
    },
  });
}

export default function MotorcycleFields({ register, errors }: { register: UseFormRegister<MotorcycleInput>; errors: FieldErrors<MotorcycleInput> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextInput label="Immatriculation" required className="[&_input]:uppercase" error={errors.plate_number?.message} {...register('plate_number')} />
      <TextInput label="Marque" required error={errors.brand?.message} {...register('brand')} />
      <TextInput label="Modèle" error={errors.model?.message} {...register('model')} />
      <TextInput label="Couleur" error={errors.color?.message} {...register('color')} />
      <TextInput label="Année" inputMode="numeric" error={errors.year?.message} {...register('year')} />
      <TextInput label="Numéro de châssis" className="[&_input]:uppercase" error={errors.chassis_number?.message} {...register('chassis_number')} />
    </div>
  );
}
