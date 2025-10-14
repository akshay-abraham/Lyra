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
  useSidebar,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Logo } from "@/components/layout/logo"
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, GraduationCap, LogOut, PlusCircle } from 'lucide-react';
import React from "react";
import { useFirebase } from "@/firebase";
import { Button } from "../ui/button";
import { ChatHistory } from "../student/chat-history";

function SidebarMenuItems() {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();
  const [userInfo, setUserInfo] = React.useState<{role?: string} | null>(null);

  React.useEffect(() => {
    const storedInfo = sessionStorage.getItem('lyra-user-info');
    if (storedInfo) {
      setUserInfo(JSON.parse(storedInfo));
    }
  }, [pathname]);

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarMenu>
        <SidebarMenuItem>
            <Link href="/" onClick={handleLinkClick}>
            <SidebarMenuButton isActive={pathname === '/'} tooltip="New Chat">
                <PlusCircle />
                <span>New Chat</span>
            </SidebarMenuButton>
            </Link>
        </SidebarMenuItem>
      
      <SidebarSeparator />
        <ChatHistory onLinkClick={handleLinkClick} />
      <SidebarSeparator />

      {userInfo?.role === 'teacher' && (
        <SidebarMenuItem>
            <Link href="/teacher" onClick={handleLinkClick}>
            <SidebarMenuButton isActive={pathname.startsWith('/teacher')} tooltip="Teacher">
                <GraduationCap />
                <span>Teacher</span>
            </SidebarMenuButton>
            </Link>
        </SidebarMenuItem>
      )}
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
    const { auth } = useFirebase();
    const router = useRouter();

    const handleLogout = async () => {
        await auth.signOut();
        sessionStorage.removeItem('lyra-user-info');
        router.push('/login');
    }

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
          <div className="p-2">
            <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-2">
                <LogOut className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">Logout</span>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-start border-b px-4 md:hidden bg-card/80 backdrop-blur-sm sticky top-0 z-10">
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
