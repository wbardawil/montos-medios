import type { Metadata } from 'next';
import { StateProvider } from '@/lib/state';
import './globals.css';

export const metadata: Metadata = {
  title: 'SAMMP — Portfolio Mix Manager',
  description: 'Administración de mezcla de portafolio por aseguradora × especialidad',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-slate-50 min-h-screen text-slate-900 antialiased">
        <StateProvider>{children}</StateProvider>
      </body>
    </html>
  );
}
