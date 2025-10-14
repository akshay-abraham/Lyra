'use client';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { ChatInterface } from '@/components/student/chat-interface';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';


function ChatPageContent() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chatId');

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || !user) {
      return null; // Or a loading spinner
  }

  return (
    <SidebarLayout>
      <ChatInterface key={chatId} chatId={chatId} />
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
