'use client';
import { useState } from 'react';
import { TeacherDashboard } from '@/components/teacher/teacher-dashboard';
import { TeacherLogin } from '@/components/teacher/teacher-login';

export default function TeacherPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    if (!isAuthenticated) {
        return <TeacherLogin onAuthSuccess={() => setIsAuthenticated(true)} />;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <TeacherDashboard />
        </div>
    );
}
