'use client';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { AccountManagement } from '@/components/account/account-management';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Suspense } from 'react';

function AccountPageContent() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [isUserLoading, user, router]);

    if (isUserLoading || !user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <SidebarLayout>
            <div className="p-4 sm:p-6 lg:p-8 animate-fade-in">
                <AccountManagement />
            </div>
        </SidebarLayout>
    );
}

export default function AccountPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AccountPageContent />
        </Suspense>
    );
}
