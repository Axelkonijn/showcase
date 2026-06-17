"use client";

import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";

export interface UserSettings {
  browserNotifications: boolean;
  emailNotifications: boolean;
  availabilityStatus: string;
}

interface AuthContextType {
  isLoggedIn: boolean;  
  availabilityStatus: string | null;
  settings: UserSettings | null; 
  checkLoginStatus: () => Promise<void>;
  checkAvailability: () => Promise<void>;
  logout: () => Promise<void>;
  updateLocalSettings: (newSettings: UserSettings) => void; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  const fetchSettings = async () => {
    try {
      const response = await api.get<UserSettings>("/api/auth/settings");
      setSettings(response.data);
    } catch (error) {
      console.error("Kon settings niet ophalen:", error);
    }
  };

  const checkLoginStatus = async () => {
    try {
      if((await api.get("/api/auth/check")).data.isAuthenticated){
        setIsLoggedIn(true);
        await fetchSettings();
        checkAvailability();
      }
      else {
        setIsLoggedIn(false);
        setSettings(null);
        checkAvailability();
      }
      
    } catch (error) {
      console.error("Login status check failed", error);
      setIsLoggedIn(false);
      setSettings(null);
      checkAvailability();
    }
  };

  const checkAvailability = async () => {
    try {
      const response = await api.get<{ status: string }>("/api/auth/status");
      setAvailabilityStatus(response.data.status);
    } catch (error) {
      console.error("Kon beschikbaarheid niet ophalen:", error);
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
      setIsLoggedIn(false);
      setSettings(null);
      window.location.href = "/admin";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const updateLocalSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, availabilityStatus, settings, checkLoginStatus, checkAvailability, logout, updateLocalSettings }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};