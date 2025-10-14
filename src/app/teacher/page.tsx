'use client';
import { TeacherDashboard } from '@/components/teacher/teacher-dashboard';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SidebarLayout } from '@/components/layout/sidebar-layout';

export default function TeacherPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<{role?: string} | null>(null);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
        if (user) {
            const storedInfo = sessionStorage.getItem('lyra-user-info');
            if (storedInfo) {
                setUserInfo(JSON.parse(storedInfo));
            }
        }
    }, [isUserLoading, user, router]);

    if (isUserLoading || !user || userInfo?.role !== 'teacher') {
        // You can show a loading indicator or a simple "Access Denied" message
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Loading or unauthorized...</p>
            </div>
        );
    }

    return (
        <SidebarLayout>
            <div className="p-4 sm:p-6 lg:p-8 animate-fade-in">
                <TeacherDashboard />
            </div>
        </SidebarLayout>
    );
}
