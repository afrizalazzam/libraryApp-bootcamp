"use client";

import { useEffect, useState } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "@/lib/redux/store";
import { setCredentials, setHydrated } from "@/lib/redux/features/authSlice";
import { loadSession } from "@/lib/auth-storage";
import { ToastProvider } from "@/components/ui/toast";

function AuthRehydrator() {
  useEffect(() => {
    const session = loadSession();
    if (session) {
      store.dispatch(setCredentials(session));
    }
    store.dispatch(setHydrated());
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthRehydrator />
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
