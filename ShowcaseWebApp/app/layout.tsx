import type { Metadata } from "next";
import "./globals.css";
import GDPRBanner from "@/components/GDPRBanner"
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: "Showcase",
  description: "Showing webdev skills",
  icons: {
    icon: [
      {
        url: '/favicon-light.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/favicon-dark.png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <Navbar/>
            <main>{children}</main>        
            <GDPRBanner/>
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
