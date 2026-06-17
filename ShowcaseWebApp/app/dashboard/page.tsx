'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { AxiosError } from 'axios';
import api from '../../lib/api';
import { ContactMessage } from '../../types/contact';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [notifSupported, setNotifSupported] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();

  const fetchMessages = async () => {
    try {
      const response = await api.get<ContactMessage[]>('/api/contact');
      setMessages(response.data);
      setLoading(false);
      return true;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 403) {
        setIsAuthorized(false);
        setLoading(false);
        return false;
      }
      
      console.error('Fout bij ophalen:', error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        logout(); 
      }
      return false;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Weet je zeker je dit bericht wilt verwijderen?')) return;

    try {
      await api.delete(`/api/contact/${id}`);
      setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== id));
      toast.success('Bericht verwijderd');
    } catch (error) {
      console.error("Fout bij verwijderen:", error);
      alert("Kon bericht niet verwijderen.");
      toast.error('Kon bericht niet verwijderen');
    }
  };

  const requestNotificationPermission = () => {
    Notification.requestPermission().then((permission) => {
      setNotificationPermission(permission);
      if (permission === 'granted') {
        toast.success('Browser notificaties ingeschakeld!');
        new Notification('Test Notificatie', { body: 'Meldingen werken!' });
      }
    });
  };

  useEffect(() => {
    if ('Notification' in window) {
      setNotifSupported(true);
      setNotificationPermission(Notification.permission);
    }

    let connection: HubConnection | null = null;

    const initDashboard = async () => {
      setIsAuthorized(await fetchMessages())

      if (isAuthorized) {
        connection = new HubConnectionBuilder()
          .withUrl("/hub/contact")
          .withAutomaticReconnect()
          .build();

        connection.start()
          .then(() => console.log("SignalR Connected!"))
          .catch(err => console.error("SignalR Connection Error: ", err));

        connection.on("ReceiveMessage", (senderName: string) => {

          if (document.visibilityState === 'hidden' && Notification.permission === 'granted') {
            const notif = new Notification('Nieuw bericht!', {
              body: `Je hebt een bericht ontvangen van ${senderName}.`,
              icon: '/favicon-light.png'
            });
            
            notif.onclick = () => {
              window.focus();
            };
          } else {
            toast.info(`Nieuw bericht van ${senderName}`, {
              action: {
                label: 'Bekijk',
                onClick: () => console.log('Scroll naar bericht of highlight'),
              },
            });
          }
          
          fetchMessages(); 
        });
      }
    };

    initDashboard();

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, []);

  if (loading && isAuthorized) return <div className="p-8 text-zinc-500">Laden...</div>;
  
  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>          
          <div className="flex gap-4">
            {notificationPermission !== 'granted' && notifSupported && (
              <button
                onClick={requestNotificationPermission}
                className="bg-accent/10 text-accent hover:bg-accent/20 px-4 py-2 rounded-md transition-colors text-sm font-semibold"
              >
                🔔 Zet meldingen aan
              </button>
            )}

            <button 
               onClick={logout}
               className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Uitloggen
            </button>
          </div>
        </div>
        {!isAuthorized ? (
        <div className="p-8 text-zinc-500">
          Je bent niet geautoriseerd. Log in als Admin om toegang te krijgen.
        </div>
      ) : (
        <div className="bg-zinc-50 dark:bg-zinc-900 shadow-xl rounded-2xl overflow-x-auto border border-zinc-200 dark:border-zinc-800">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-100 dark:bg-zinc-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Datum</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Naam</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Onderwerp</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Bericht</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {messages.map((msg) => (
                <tr key={msg.id} className="hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                    {new Date(msg.createdAt).toLocaleString('nl-NL')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {msg.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                    {msg.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-accent">
                    {msg.email} <br/>
                    <span className="text-zinc-400 text-xs">{msg.phone}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500 max-w-xs truncate">
                    {msg.messageText}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      Verwijder
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {messages.length === 0 && (
            <div className="p-12 text-center text-zinc-500 italic">
              Nog geen berichten ontvangen.
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}