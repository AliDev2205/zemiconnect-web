'use client';

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@/lib/query/queryClient';

interface Props {
  children: React.ReactNode;
}

export default function QueryProvider({ children }: Props) {
  // Un QueryClient stable par montage navigateur, jamais partagé entre requêtes serveur.
  const [queryClient] = useState(() => createQueryClient());

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
