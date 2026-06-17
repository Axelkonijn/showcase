"use client";

import { useTheme } from "@/context/ThemeContext";

export default function ThemeSettings() {
  const { accentColor, setAccentColor} = useTheme();

  const presets = ["#2563eb", "#ea580c", "#16a34a", "#db2777", "#7c3aed"];

  return (
    <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-6">
        <h4 className="text-sm font-bold mb-3">Accent Kleur</h4>
        <div className="flex flex-wrap gap-3 items-center">
          {presets.map((color) => (
            <button
              key={color}
              onClick={() => setAccentColor(color)}
              className="w-6 h-6 rounded-full border-2 border-white dark:border-zinc-800 shadow-sm"
              style={{ backgroundColor: color }}
            />
          ))}
          <input 
            type="color" 
            value={accentColor} 
            onChange={(e) => setAccentColor(e.target.value)}
            className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer"
          />
        </div>
    </div>
  );
}