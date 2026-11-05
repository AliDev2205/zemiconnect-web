import React from 'react';
import { Construction } from 'lucide-react';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from './PageHeader';

interface PagePlaceholderProps {
  title: string;
  // Référence de l'écran dans le cahier (PU1, GE1, AD1…).
  code?: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
  children?: React.ReactNode;
}

// Page du squelette : titre dans la bonne coque + « Écran à venir ».
export default function PagePlaceholder({ title, code, subtitle, actions, back, children }: PagePlaceholderProps) {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={title} subtitle={subtitle} actions={actions} back={back} />
      {children}
      <Card padded={false}>
        <EmptyState
          icon={<Construction size={24} />}
          title="Écran à venir"
          message={code ? `Écran ${code} : sera développé dans une prochaine étape.` : 'Sera développé dans une prochaine étape.'}
        />
      </Card>
    </div>
  );
}
