"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

export default function AccountSettings() {
  const { settings, updateLocalSettings } = useAuth();
  
  const [browserNotifications, setBrowserNotifications] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [availabilityStatus, setAvailabilityStatus] = useState("Available");
  const [isSaving, setIsSaving] = useState(false);

  // Sync state met de geladen settings uit de context
  useEffect(() => {
    if (settings) {
      setBrowserNotifications(settings.browserNotifications);
      setEmailNotifications(settings.emailNotifications);
      setAvailabilityStatus(settings.availabilityStatus);
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        browserNotifications,
        emailNotifications,
        availabilityStatus
      };

      await api.put("/api/auth/settings", payload);
      updateLocalSettings(payload);
      toast.success("Instellingen opgeslagen!");
    } catch (error) {
      console.error(error);
      toast.error("Kon instellingen niet opslaan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Beschikbaarheid */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Jouw Status (Publiek zichtbaar)
        </label>
        <select 
            value={availabilityStatus}
            onChange={(e) => setAvailabilityStatus(e.target.value)}
            className="w-full p-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-accent outline-none"
        >
            <option value="Available">🟢 Beschikbaar voor werk</option>
            <option value="Busy">🟠 Druk / In Opdracht</option>
            <option value="Offline">🔴 Niet Beschikbaar</option>
        </select>
        <p className="text-xs text-zinc-500 mt-1">
            Dit bepaalt wat bezoekers zien op de contactpagina.
        </p>
      </div>

      <hr className="border-zinc-200 dark:border-zinc-800" />

      {/* Browser Notificaties */}
      <div className="flex items-center justify-between">
        <div>
            <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Browser Meldingen</h3>
            <p className="text-sm text-zinc-500">Ontvang een popup (Toast) als je het dashboard open hebt staan.</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
            <input 
                type="checkbox" 
                checked={browserNotifications} 
                onChange={(e) => setBrowserNotifications(e.target.checked)} 
                className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
        </label>
      </div>

      {/* Email Notificaties */}
      <div className="flex items-center justify-between">
        <div>
            <h3 className="font-medium text-zinc-900 dark:text-zinc-100">E-mail Notificaties</h3>
            <p className="text-sm text-zinc-500">Laat de server een mail sturen bij nieuwe berichten.</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
            <input 
                type="checkbox" 
                checked={emailNotifications} 
                onChange={(e) => setEmailNotifications(e.target.checked)} 
                className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
        </label>
      </div>

      {/* Opslaan Knop */}
      <div className="pt-4 flex justify-end">
        <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-accent text-white px-6 py-2 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
            {isSaving ? 'Opslaan...' : 'Opslaan'}
        </button>
      </div>
    </div>
  );
}