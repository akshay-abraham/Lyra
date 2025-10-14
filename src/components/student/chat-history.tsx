'use client';

import React from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirebase, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { SidebarMenuItem, SidebarMenuButton, SidebarMenuSkeleton } from '../ui/sidebar';
import Link from 'next/link';
import { MessageSquareText } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { allSubjects, type SubjectData } from '@/lib/subjects-data';

interface ChatSession {
    id: string;
    title: string;
    subject: string;
}

const subjectDataMap = new Map<string, SubjectData>(allSubjects.map(s => [s.name, s]));

export function ChatHistory({ onLinkClick }: { onLinkClick: () => void }) {
    const { firestore } = useFirebase();
    const { user } = useUser();
    const pathname = usePathname();

    const chatSessionsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'users', user.uid, 'chatSessions'),
            orderBy('startTime', 'desc')
        );
    }, [user, firestore]);

    const { data: chatSessions, isLoading } = useCollection<ChatSession>(chatSessionsQuery);

    const groupedSessions = React.useMemo(() => {
        if (!chatSessions) return {};
        return chatSessions.reduce((acc, session) => {
            const subject = session.subject || 'Other';
            if (!acc[subject]) {
                acc[subject] = [];
            }
            acc[subject].push(session);
            return acc;
        }, {} as Record<string, ChatSession[]>);
    }, [chatSessions]);

    if (isLoading) {
        return (
            <div className="px-2">
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
            </div>
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
        <Accordion type="multiple" className="w-full group-data-[collapsible=icon]:hidden px-2">
            {Object.entries(groupedSessions).map(([subject, sessions]) => {
                const subjectInfo = subjectDataMap.get(subject);
                const Icon = subjectInfo?.icon || MessageSquareText;
                
                return (
                    <AccordionItem value={subject} key={subject} className="border-b-0">
                        <AccordionTrigger className="py-2 px-2 hover:no-underline hover:bg-sidebar-accent rounded-md text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" style={{ color: subjectInfo?.color }}/>
                                <span className="truncate">{subject}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-4 pt-1">
                            <div className="flex flex-col gap-1">
                                {sessions.map((session) => (
                                    <SidebarMenuItem key={session.id}>
                                        <Link href={`/?chatId=${session.id}`} onClick={onLinkClick}>
                                            <SidebarMenuButton 
                                            isActive={pathname.includes(session.id)} 
                                            tooltip={session.title}
                                            className="h-auto py-1.5"
                                            >
                                                <MessageSquareText />
                                                <span className="truncate">{session.title}</span>
                                            </SidebarMenuButton>
                                        </Link>
                                    </SidebarMenuItem>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                );
            })}
        </Accordion>
    );
}
