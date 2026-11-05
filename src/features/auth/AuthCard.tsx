import React from 'react';

interface Props {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

// Carte commune des écrans AU1 à AU4 (colonne centrée du layout (auth)).
export default function AuthCard({ title, description, children, footer }: Props) {
  return (
    <section className="flex flex-col gap-5 rounded-card border border-border bg-surface p-5 sm:p-8">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted">{description}</p>}
      </header>
      {children}
      {footer && <footer className="border-t border-border pt-4 text-center text-sm">{footer}</footer>}
    </section>
  );
}
