"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { ContactFormData } from '@/types/contact';

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '', lastName: '', email: '', phone: '', subject: '', message: '', captchaNumA: 0, captchaNumB: 0, captchaAnswer: ''
  });
  const [dirty, setDirty] = useState({ firstName: false, lastName: false, email: false, phone: false, subject: false, message: false, captchaAnswer: false });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<boolean | undefined>(undefined);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const { availabilityStatus } = useAuth();
  const availabilityMap = {
      Available: {
        label: "Beschikbaar voor werk",
        dot: "bg-green-500",
        text: "text-green-700 dark:text-green-400",
      },
      Busy: {
        label: "Druk / In opdracht",
        dot: "bg-orange-500",
        text: "text-orange-700 dark:text-orange-400",
      },
      Offline: {
        label: "Niet beschikbaar",
        dot: "bg-red-500",
        text: "text-red-700 dark:text-red-400",
      },
    } as const;
  const availability =
    availabilityStatus
      ? availabilityMap[availabilityStatus as keyof typeof availabilityMap]
      : undefined;
  

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    setFormData(prev => ({
      ...prev,
      captchaNumA: Math.floor(Math.random() * 10) + 1,
      captchaNumB: Math.floor(Math.random() * 10) + 1,
      captchaAnswer: ''
    }));
  };

  const resetStates = () =>
  {
    setFormData({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '', captchaNumA: 0, captchaNumB: 0, captchaAnswer: '' });
    setDirty({ firstName: false, lastName: false, email: false, phone: false, subject: false, message: false, captchaAnswer: false });
    generateCaptcha();
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.target.value) setDirty({ ...dirty, [e.target.name]: true });
    validate();
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const phoneRegex = /^(?!0+$)(\+\d{1,3}[- ]?)?(?!0+$)\d{10,15}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.firstName || formData.firstName.length > 60) newErrors.firstName = "Voornaam is verplicht (max 60 tekens).";
    if (!formData.lastName || formData.lastName.length > 60) newErrors.lastName = "Achternaam is verplicht (max 60 tekens).";
    if (!emailRegex.test(formData.email) || formData.email.length > 80) newErrors.email = "Voer een geldig e-mailadres in (max 80 tekens).";
    if (!phoneRegex.test(formData.phone)) newErrors.phone = "Ongeldig telefoonnummer (10-15 cijfers).";
    if (!formData.subject || formData.subject.length > 200) newErrors.subject = "Onderwerp is verplicht (max 200 tekens).";
    if (!formData.message || formData.message.length > 600) newErrors.message = "Bericht is verplicht (max 600 tekens).";

    if (!formData.captchaAnswer) {
        newErrors.captchaAnswer = "Los de som op.";
    } else {
        if (isNaN(Number(formData.captchaAnswer))) {
            newErrors.captchaAnswer = "Voer een getal in.";
        }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setDirty({ firstName: true, lastName: true, email: true, phone: true, subject: true, message: true, captchaAnswer: true });
    if (!validate()) return;

    setIsSubmitting(true);
    
    try {
    const response = await fetch(`${apiUrl}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    
    if (response.ok) {
      setSuccess(true);
      resetStates();
      
    } else {
      const errorData = await response.json();
      console.error("Server errors:", errorData);
      if (errorData.errors?.captcha) {
        setErrors({ captchaAnswer: "Incorrect antwoord. Probeer het opnieuw." });
        generateCaptcha(); // Give them a new sum
      } else {
        setErrors({ server: "De server weigerde het formulier. Probeer het later opnieuw." });
      }
      setSuccess(false);
    }
    } catch (err) {
      setErrors({ server: "De mailserver is niet bereikbaar. Probeer het later opnieuw" });
      setSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success === true) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-2xl text-center shadow-sm">
        <h2 className="text-2xl font-bold text-green-800 dark:text-green-400 mb-2">Bericht Verzonden!</h2>
        <p className="text-zinc-800 dark:text-zinc-200">Bedankt voor je bericht. Ik neem zo snel mogelijk contact met je op.</p>
        <button onClick={() => setSuccess(undefined)} className="mt-4 text-sm underline text-green-800 hover:text-green-600 dark:text-green-400">Terug</button>
      </div>
    );
  }

  if (success === false) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-2xl text-center shadow-sm">
        <h2 className="text-2xl font-bold text-red-800 dark:text-red-400 mb-2">Bericht niet verzonden.</h2>
        <p className="text-zinc-800 dark:text-zinc-200">{errors.server}</p>
        <button onClick={() => setSuccess(undefined)} className="mt-4 text-sm underline text-green-800 hover:text-red-600 dark:text-red-400">Terug</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">        
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-4xl">Contact Opnemen</h1>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            Heb je een vraag of wil je samenwerken? Vul het onderstaande formulier in.
          </p>
        </header>
        <div className="mb-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-4">
          <p className="text-sm text-zinc-500">Beschikbaarheid</p>
          {availability ? (
            <div className={`mt-1 flex items-center gap-2 font-semibold ${availability.text}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${availability.dot}`} />
              <span>{availability.label}</span>
            </div>
          ) : (
            <div className="mt-1 text-sm text-zinc-500">Beschikbaarheid laden...</div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8 bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          
          {/* First Name */}
          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Voornaam</label>
                <input
                type="text"
                name="firstName"
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full rounded-md border bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 ${(errors.firstName && dirty.firstName) ? 'border-red-500' : 'border-zinc-300, dark:border-zinc-700'}`}
                />
                {(errors.firstName && dirty.firstName) && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
            </div>

            {/* Last Name */}
            <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Achternaam</label>
                <input
                type="text"
                name="lastName"
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full rounded-md border bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 ${(errors.lastName && dirty.lastName) ? 'border-red-500' : 'border-zinc-300, dark:border-zinc-700'}`}
                />
                {(errors.lastName && dirty.lastName) && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
            </div>
          </div>
          {/* Email & Phone (Full width on small, side-by-side on large) */}
          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">E-mail</label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full rounded-md border bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2 sm:text-sm ${(errors.email && dirty.email) ? 'border-red-500' : 'border-zinc-300, dark:border-zinc-700'}`}
              />
              {(errors.email && dirty.email) && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Telefoon</label>
              <input
                type="text"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full rounded-md border bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2 sm:text-sm ${(errors.phone && dirty.phone) ? 'border-red-500' : 'border-zinc-300, dark:border-zinc-700'}`}
              />
              {(errors.phone && dirty.phone) && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>
          </div>

          {/* Subject */}
          <div className="sm:col-span-2">
            <label htmlFor="subject" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Onderwerp</label>
            <input
              type="text"
              name="subject"
              id="subject"
              value={formData.subject}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`mt-1 block w-full rounded-md border bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2 sm:text-sm ${(errors.subject && dirty.subject) ? 'border-red-500' : 'border-zinc-300, dark:border-zinc-700'}`}
            />
            {(errors.subject && dirty.subject) && <p className="mt-1 text-xs text-red-500">{errors.subject}</p>}
          </div>

          {/* Message */}
          <div className="sm:col-span-2">
            <label htmlFor="message" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Bericht ({formData.message.length}/600)</label>
            <textarea
              name="message"
              id="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`mt-1 block w-full rounded-md border bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2 sm:text-sm ${(errors.message && dirty.message) ? 'border-red-500' : 'border-zinc-300, dark:border-zinc-700'}`}
            />
            {(errors.message && dirty.message) && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
          </div>
          
          {/* Captcha */}
          <div className="sm:col-span-2">
              <label htmlFor="captchaAnswer" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Veiligheidsvraag: Hoeveel is {formData.captchaNumA} + {formData.captchaNumB}?
              </label>
              <input
                  type="text"
                  name="captchaAnswer"
                  id="captchaAnswer"
                  value={formData.captchaAnswer}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Antwoord"
                  className={`mt-1 block w-full rounded-md border bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2 sm:text-sm ${(errors.captchaAnswer && dirty.captchaAnswer) ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'}`}
              />
              {(errors.captchaAnswer && dirty.captchaAnswer) && <p className="mt-1 text-xs text-red-500">{errors.captchaAnswer}</p>}
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-3 rounded-md border border-transparent py-3 px-6 text-base font-medium text-white shadow-sm bg-accent hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:bg-accent/60 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Versturen...</span>
                </>
              ) : (
                'Verstuur Bericht'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}