'use client';
import { useAuth } from '@/components/auth/auth-provider';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { ChatInterface } from '@/components/student/chat-interface';


export default function StudentPage() {
  const { user, loading } = useAuth();

  if (loading) {
      return null;
  }

  return (
    <SidebarLayout>
      {user && <ChatInterface />}
    </SidebarLayout>
  );
}
