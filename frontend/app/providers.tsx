"use client";

import { UiProvider } from '@/context/ui-context';
import { TelemetryProvider } from '@/context/telemetry-context';
import { ToastProvider } from '@/context/toast-context';
import { ToastContainer } from '@/components/toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UiProvider>
      <ToastProvider>
        <TelemetryProvider>
          {children}
          <ToastContainer />
        </TelemetryProvider>
      </ToastProvider>
    </UiProvider>
  );
}
