"use client";

import { useState } from "react";
import Sidebar from "@/components/SideBar";
import Header from "@/components/header";
import { X } from "lucide-react";

export default function DashboardShell({
  children,
  userName,
  planLabel,
  isPremium,
}: {
  children: React.ReactNode;
  userName: string;
  planLabel: string;
  isPremium: boolean;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="flex h-screen bg-brand-surface overflow-hidden">
      <aside className="hidden md:flex w-64 flex-col border-r border-border-subtle bg-surface-card">
        <Sidebar userName={userName} planLabel={planLabel} isPremium={isPremium} />
      </aside>

      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-brand-scrim backdrop-blur-sm transition-opacity"
            onClick={closeMenu}
          />
          <div className="relative flex flex-col w-72 h-full bg-surface-card shadow-2xl transition-transform duration-300 overflow-hidden">
            <div className="flex justify-end p-4 shrink-0">
              <button
                onClick={closeMenu}
                className="p-2 text-text-secondary hover:bg-surface-muted rounded-lg"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <Sidebar onClose={closeMenu} userName={userName} planLabel={planLabel} isPremium={isPremium} />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Header onOpenMenu={() => setIsMenuOpen(true)} userName={userName} />
        <main className="flex-1 overflow-y-auto bg-brand-surface pb-20 sm:pb-0">{children}</main>
      </div>
    </div>
  );
}
