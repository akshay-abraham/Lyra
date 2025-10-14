import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarLayout } from '@/components/layout/sidebar-layout';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-sora',
});


export const metadata: Metadata = {
  title: 'Lyra: Ethical AI Tutor',
  description: 'An ethical AI tutor for students, customizable by teachers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className='dark'>
      <head>
      </head>
      <body className={`${inter.variable} ${sora.variable} font-body antialiased bg-background text-foreground`}>
        <SidebarLayout>
          {children}
        </SidebarLayout>
        <Toaster />
      </body>
    </html>
  );
}
