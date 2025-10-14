'use client';
import { useAuth } from '@/components/auth/auth-provider';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { ChatInterface } from '@/components/student/chat-interface';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';


function ChatPageContent() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chatId');

  if (loading) {
      return null;
  }

  return (
    <SidebarLayout>
      {user && <ChatInterface key={chatId} chatId={chatId} />}
    </SidebarLayout>
  );
}

export default function StudentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}
