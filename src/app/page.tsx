'use client';
import { useAuth } from '@/components/auth/auth-provider';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { ChatInterface } from '@/components/student/chat-interface';
import LoginPage from './login/page';


export default function StudentPage() {
  const { user, loading } = useAuth();

  if (loading) {
      return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <SidebarLayout>
      <ChatInterface />
    </SidebarLayout>
  );
}
