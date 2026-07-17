"use client";

import { useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket() {
  const [connected, setConnected] = useState(false);
  const [signal, setSignal] = useState(0);

  const socket = useMemo(() => io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
    autoConnect: false,
    transports: ['websocket'],
  }), []);

  useEffect(() => {
    socket.connect();
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('friction', (payload: { score?: number }) => {
      setSignal(payload?.score ?? 0);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('friction');
      socket.disconnect();
    };
  }, [socket]);

  return { connected, signal, socket } as const;
}
