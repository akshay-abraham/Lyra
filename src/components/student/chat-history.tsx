'use client';

import React from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirebase, useUser } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { SidebarMenuItem, SidebarMenuButton, SidebarMenuSkeleton } from '../ui/sidebar';
import Link from 'next/link';
import { MessageSquareText } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface ChatSession {
    id: string;
    title: string;
    subject: string;
}

export function ChatHistory({ onLinkClick }: { onLinkClick: () => void }) {
    const { firestore } = useFirebase();
    const { user } = useUser();
    const pathname = usePathname();

    const chatSessionsQuery = React.useMemo(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'users', user.uid, 'chatSessions'),
            orderBy('startTime', 'desc')
        );
    }, [user, firestore]);

    const { data: chatSessions, isLoading } = useCollection<ChatSession>(chatSessionsQuery);

    if (isLoading) {
        return (
            <>
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
            </>
        );
    }

    if (!chatSessions || chatSessions.length === 0) {
        return (
            <div className="px-4 py-2 text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
                Your chat history will appear here.
            </div>
        );
    }

    return (
        <>
            {chatSessions.map((session) => (
                <SidebarMenuItem key={session.id}>
                    <Link href={`/?chatId=${session.id}`} onClick={onLinkClick}>
                        <SidebarMenuButton 
                          isActive={pathname.includes(session.id)} 
                          tooltip={session.title}
                        >
                            <MessageSquareText />
                            <span>{session.title}</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            ))}
        </>
    );
}
