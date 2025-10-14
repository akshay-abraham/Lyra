'use client';
import { TeacherDashboard } from '@/components/teacher/teacher-dashboard';
import { useAuth } from '@/components/auth/auth-provider';
import LoginPage from '../login/page';
import { SidebarLayout } from '@/components/layout/sidebar-layout';

export default function TeacherPage() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }
    
    if (!user || user.role !== 'teacher') {
        return <LoginPage />;
    }

    return (
        <SidebarLayout>
            <div className="p-4 sm:p-6 lg:p-8 animate-fade-in">
                <TeacherDashboard />
            </div>
        </SidebarLayout>
    );
}
