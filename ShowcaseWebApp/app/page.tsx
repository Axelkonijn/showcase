import { redirect } from 'next/navigation';

export default function Home() {
  // This built-in Next.js function performs a server-side redirect
  redirect('/profile');
}