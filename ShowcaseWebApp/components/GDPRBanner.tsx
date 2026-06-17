'use client'; // This tells Next.js this is a Client Component

import { useState, useEffect } from 'react';

export default function GDPRBanner() {
    const [status, setStatus] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const savedStatus = localStorage.getItem('gdpr-consent-choice');

        if (savedStatus !== 'accept') {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('gdpr-consent-choice', 'accept');
        setStatus('accept');
        setIsVisible(false); 
    };
    
    const handleReject = () => {
        localStorage.setItem('gdpr-consent-choice', 'reject');
        setStatus('reject');
        setIsVisible(false);
    };


    if (!isVisible) return null;

    return (
        <section className="fixed bottom-0 left-0 right-0 m-4 p-6 bg-white dark:bg-zinc-900 border-2 border-zinc-300 dark:border-zinc-700 rounded-2xl shadow-xl z-[9999] flex flex-col items-center gap-4">
            <div className="text-center text-zinc-800 dark:text-zinc-200">
                <p>
                    Deze website gebruikt cookies. We gebruiken cookies om dingen te doen. Don't worry about it.
                </p>
            </div>
            <div className="flex flex-row-reverse justify-center gap-4 w-full">
                <button 
                    onClick={() => handleReject()} 
                    className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 py-2 px-6 rounded-lg border border-zinc-300 transition-colors font-medium"
                >
                    Nee, misschien later
                </button>

                <button 
                    onClick={() => handleAccept()} 
                    className="bg-green-100 hover:bg-green-200 text-green-800 py-2 px-6 rounded-lg border border-green-300 transition-colors font-medium"
                >
                    Ja, natuurlijk
                </button>
            </div>
        </section>
    );
}