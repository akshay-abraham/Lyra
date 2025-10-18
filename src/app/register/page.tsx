
import { RegisterForm } from '@/components/auth/register-form';
import { Suspense } from 'react';

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
