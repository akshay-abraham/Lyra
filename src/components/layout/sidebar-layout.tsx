'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter
} from "@/components/ui/sidebar"
import { Logo } from "@/components/layout/logo"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, GraduationCap, MessageSquare } from 'lucide-react';


export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Logo />
            <span className="text-xl font-headline font-bold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              Lyra
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
                <Link href="/" passHref legacyBehavior>
                    <SidebarMenuButton isActive={pathname === '/'} tooltip="Chat">
                        <MessageSquare />
                        <span>Chat</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/teacher" passHref legacyBehavior>
                    <SidebarMenuButton isActive={pathname.startsWith('/teacher')} tooltip="Teacher">
                        <GraduationCap />
                        <span>Teacher</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/about" passHref legacyBehavior>
                    <SidebarMenuButton isActive={pathname.startsWith('/about')} tooltip="About">
                        <BookOpen />
                        <span>About</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          {/* Footer content can go here */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-start border-b px-4 md:hidden">
            <SidebarTrigger />
             <Link href="/" className="ml-4 flex items-center space-x-2">
                <Logo />
                <span className="font-bold font-headline">Lyra</span>
              </Link>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
