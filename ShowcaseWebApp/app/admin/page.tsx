'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { useAuth } from '@/context/AuthContext';


export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { checkLoginStatus } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/login?useCookies=true', {
        email: email,
        password: password,
      });
      await checkLoginStatus();
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Inloggen mislukt. Controleer je gegevens.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black text-zinc-900 dark:text-zinc-50">
      <div className="w-full max-w-md bg-zinc-50 dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
        <h1 className="text-3xl font-bold mb-6 text-center tracking-tight">Admin Login</h1>
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-md mb-4 text-sm border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
            <input
              type="email"
              name="email"
              required
              className="mt-1 block w-full bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-accent outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@showcase.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Wachtwoord</label>
            <input
              type="password"
              name="password"
              required
              className="mt-1 block w-full bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-accent outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-accent text-white py-2 px-4 rounded-md hover:opacity-90 transition-opacity font-bold">
            Inloggen
          </button>
        </form>
      </div>
    </div>
  );
}