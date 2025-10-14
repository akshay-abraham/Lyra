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
  SidebarFooter,
  useSidebar
} from "@/components/ui/sidebar"
import { Logo } from "@/components/layout/logo"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, GraduationCap, MessageSquare } from 'lucide-react';
import React from "react";

function SidebarMenuItems() {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link href="/" onClick={handleLinkClick}>
          <SidebarMenuButton isActive={pathname === '/'} tooltip="Chat">
            <MessageSquare />
            <span>Chat</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <Link href="/teacher" onClick={handleLinkClick}>
          <SidebarMenuButton isActive={pathname.startsWith('/teacher')} tooltip="Teacher">
            <GraduationCap />
            <span>Teacher</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <Link href="/about" onClick={handleLinkClick}>
          <SidebarMenuButton isActive={pathname.startsWith('/about')} tooltip="About">
            <BookOpen />
            <span>About</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function SidebarLayout({ children }: { children: React.ReactNode }) {

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
          <SidebarMenuItems />
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
