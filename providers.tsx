"use client";

import { UiProvider } from '@/context/ui-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return <UiProvider>{children}</UiProvider>;
}
