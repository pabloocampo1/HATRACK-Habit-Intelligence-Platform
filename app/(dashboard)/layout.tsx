"use client";
import { useState } from "react";
import Sidebar from "@/components/SideBar";
import Header from "@/components/header";
import { X } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="flex h-screen bg-brand-offwhite overflow-hidden">
      <aside className="hidden md:flex w-64 flex-col border-r border-gray-100 bg-white">
        <Sidebar />
      </aside>

      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={closeMenu}
          />

          <div className="relative flex flex-col w-72 h-full bg-white shadow-2xl transition-transform duration-300">
            <div className="flex justify-end p-4">
              <button
                onClick={closeMenu}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <Sidebar onClose={closeMenu} />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Header onOpenMenu={() => setIsMenuOpen(true)} userName="Juan Díaz" />
        <main className="flex-1 overflow-y-auto bg-gray-50/50">{children}</main>
      </div>
    </div>
  );
}
