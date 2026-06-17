"use client";

import ThemeSettings from "@/components/ThemeSettings";
import AccountSettings from "@/components/AccountSettings";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { isLoggedIn, settings } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Instellingen</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Pas de applicatie aan naar jouw wensen.
          </p>
        </header>

        <div className="space-y-8">
          {/* Sectie 1: Vormgeving */}
          <section className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Vormgeving</h2>
            <ThemeSettings />
          </section>

          {/* Sectie 2: Account (Alleen voor admins) */}
          <section className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
             <h2 className="text-xl font-semibold mb-6 text-zinc-900 dark:text-zinc-100">Account & Notificaties</h2>
             
             {isLoggedIn && settings ? (
                <AccountSettings />
             ) : (
                <div className="text-center text-sm text-zinc-400 py-4 italic">
                  Log in als beheerder om deze instellingen te wijzigen.
                </div>
             )}
          </section>
        </div>
      </div>
    </div>
  );
}