"use client";

import type { ReactNode } from "react";

import { Topbar } from "@/components/Topbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-shell p-2.5 sm:p-4 lg:p-5 print:min-h-0 print:bg-white print:p-0">
      <div className="mx-auto flex w-full max-w-[1500px] min-h-[calc(100vh-1.25rem)] flex-col overflow-hidden rounded-[26px] border border-black/[0.05] bg-white shadow-[0_28px_80px_-50px_rgba(12,59,42,0.5)] print:min-h-0 print:overflow-visible print:rounded-none print:border-0 print:shadow-none sm:min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-2.5rem)]">
        <Topbar />
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 print:px-0 print:py-0">{children}</main>
        <footer className="flex flex-col gap-1 border-t border-line px-4 py-4 text-[11px] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            Your PDF is processed on our server in memory and never stored. We never
            ask for your M-PESA PIN or OTP.
          </p>
          <p>Not affiliated with Safaricom PLC.</p>
        </footer>
      </div>
    </div>
  );
}
