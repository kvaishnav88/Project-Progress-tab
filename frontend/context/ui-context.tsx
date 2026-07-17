"use client";

import { createContext, useContext, useMemo, useState } from 'react';

type UiContextValue = {
  aiOverlayVisible: boolean;
  setAiOverlayVisible: (value: boolean) => void;
  dynamicRendererVisible: boolean;
  setDynamicRendererVisible: (value: boolean) => void;
};

const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [aiOverlayVisible, setAiOverlayVisible] = useState(true);
  const [dynamicRendererVisible, setDynamicRendererVisible] = useState(true);

  const value = useMemo(
    () => ({
      aiOverlayVisible,
      setAiOverlayVisible,
      dynamicRendererVisible,
      setDynamicRendererVisible,
    }),
    [aiOverlayVisible, dynamicRendererVisible],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUiContext() {
  const ctx = useContext(UiContext);
  if (!ctx) {
    throw new Error('useUiContext must be used within a UiProvider');
  }
  return ctx;
}
