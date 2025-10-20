// Copyright (C) 2025 Akshay K Rooben abraham
/**
 * @fileoverview Main Sidebar Layout (`sidebar-layout.tsx`)
 *
 * C-like Analogy:
 * This file defines the main structural layout for most pages of the application.
 * Think of it as a master function that draws the consistent parts of the UI,
 * like the navigation sidebar on the left and the top header on mobile.
 *
 * It takes a `children` prop, which is like a placeholder. Any page that uses
 * this layout will have its content rendered inside this placeholder.
 *
 * `void renderMainLayout(void (*renderPageContent)()) {`
 * `  drawSidebar();`
 * `  drawHeader();`
 * `  renderPageContent(); // The actual page content goes here.`
 * `}`
 *
 * It's responsible for the overall look and feel, including handling the
 * collapsible state of the sidebar, the logout functionality, and the
 * navigation links.
 */
'use client'

// Import all the necessary building blocks for the sidebar from our UI library.
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
  useSidebar, // A hook to get the sidebar's state (e.g., is it open/closed).
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Logo } from '@/components/layout/logo'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BookOpen, GraduationCap, LogOut, PlusCircle, User } from 'lucide-react'
import React from 'react'
import { useFirebase } from '@/firebase'
import { Button } from '../ui/button'
import { ChatHistory } from '../student/chat-history' // Component that shows the list of past chats.

/**
 * C-like Explanation: `function SidebarMenuItems() -> returns JSX_Element`
 *
 * This is a helper component that contains the actual list of navigation items
 * (New Chat, Teacher, Account, About). Separating it into its own component keeps
 * the main layout component cleaner.
 *
 * It uses hooks to get the current URL (`usePathname`) and the sidebar's state
 * (`useSidebar`) to determine which menu item is "active" and to automatically
 * close the mobile menu after a link is clicked.
 */
function SidebarMenuItems() {
  const pathname = usePathname() // Hook to get the current URL path.
  const { setOpenMobile, isMobile } = useSidebar() // Hook to control the mobile sidebar.
  const [userInfo, setUserInfo] = React.useState<{ role?: string } | null>(null)

  // This `useEffect` hook runs whenever the page URL changes.
  // It reads the user's role from session storage to decide whether to show the "Teacher" link.
  React.useEffect(() => {
    const storedInfo = sessionStorage.getItem('lyra-user-info')
    if (storedInfo) {
      setUserInfo(JSON.parse(storedInfo))
    }
  }, [pathname]) // Dependency: re-run if the path changes.

  // This function is called when a user clicks a link in the mobile menu.
  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false) // Close the mobile sidebar.
    }
  }

  return (
    <SidebarMenu className='p-0'>
      <div className='p-2'>
        <SidebarMenuItem>
          {/* Each link is wrapped in Next.js's `<Link>` component for fast client-side navigation. */}
          <Link href='/' onClick={handleLinkClick}>
            {/* The `isActive` prop highlights the button if the URL matches. */}
            <SidebarMenuButton isActive={pathname === '/'} tooltip='New Chat'>
              <PlusCircle />
              <span>New Chat</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      </div>

      <SidebarSeparator />
      {/*
          This component is responsible for fetching and displaying the list of
          past chat sessions from Firestore.
        */}
      <ChatHistory onLinkClick={handleLinkClick} />
      <SidebarSeparator />

      <div className='p-2'>
        {/* Conditional Rendering: Only show the "Teacher" link if the user's role is 'teacher'. */}
        {userInfo?.role === 'teacher' && (
          <SidebarMenuItem>
            <Link href='/teacher' onClick={handleLinkClick}>
              <SidebarMenuButton
                isActive={pathname.startsWith('/teacher')}
                tooltip='Teacher'
              >
                <GraduationCap />
                <span>Teacher</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        )}
        <SidebarMenuItem>
          <Link href='/account' onClick={handleLinkClick}>
            <SidebarMenuButton
              isActive={pathname.startsWith('/account')}
              tooltip='Account'
            >
              <User />
              <span>Account</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <Link href='/about' onClick={handleLinkClick}>
            <SidebarMenuButton
              isActive={pathname.startsWith('/about')}
              tooltip='About'
            >
              <BookOpen />
              <span>About</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      </div>
    </SidebarMenu>
  )
}

/**
 * C-like Explanation: `function SidebarLayout({ children }) -> returns JSX_Element`
 *
 * This is the main layout component.
 *
 * Props (Inputs):
 *   - `children`: A special prop that represents any components nested inside this one.
 *     This is where the main content of a specific page (like the chat interface or
 *     the account form) will be rendered. It's the `(*renderPageContent)()` part
 *     of our C analogy.
 */
export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { auth } = useFirebase()
  const router = useRouter()

  /**
   * C-like Explanation: `async function handleLogout()`
   * This function signs the user out of Firebase, clears their data from the
   * local session, and redirects them to the login page.
   */
  const handleLogout = async () => {
    await auth.signOut() // Call Firebase SDK to sign out.
    sessionStorage.removeItem('lyra-user-info') // Clean up local session data.
    router.push('/login') // Redirect.
  }

  return (
    // `<SidebarProvider>` is a Context Provider. It makes the sidebar's state
    // (open, closed, mobile, etc.) available to all components inside it.
    <SidebarProvider>
      {/* `<Sidebar>` is the main container for the sidebar itself. */}
      <Sidebar side='left' collapsible='icon'>
        <SidebarHeader>
          <div className='flex items-center gap-2 p-2'>
            <Logo />
            {/*
              This `<span>` is conditionally hidden with CSS when the sidebar is collapsed
              to icon-only mode (`group-data-[collapsible=icon]:hidden`).
            */}
            <span className='text-xl font-headline font-bold text-sidebar-foreground group-data-[collapsible=icon]:hidden'>
              Lyra
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenuItems />
        </SidebarContent>
        <SidebarFooter>
          <div className='p-2'>
            <Button
              variant='ghost'
              onClick={handleLogout}
              className='w-full justify-start gap-2'
            >
              <LogOut className='h-4 w-4' />
              <span className='group-data-[collapsible=icon]:hidden'>
                Logout
              </span>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      {/*
        `<SidebarInset>` is the main content area of the page. It automatically
        adjusts its margin to make space for the sidebar.
      */}
      <SidebarInset>
        {/*
          This header is only visible on mobile screens (`md:hidden`). It contains
          the "hamburger" menu trigger to open the sidebar.
        */}
        <header className='flex h-14 items-center justify-start border-b px-4 md:hidden bg-card/80 backdrop-blur-sm sticky top-0 z-10'>
          <SidebarTrigger />
          <Link href='/' className='ml-4 flex items-center space-x-2'>
            <Logo />
            <span className='font-bold font-headline'>Lyra</span>
          </Link>
        </header>
        {/* This is the placeholder where the actual page content is rendered. */}
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
