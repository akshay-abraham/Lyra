'use client';
import { useRouter, usePathname } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect } from 'react';

type Role = 'student' | 'teacher' | 'guest';

interface User {
  name: string;
  school: string;
  role: Role;
  class?: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('lyra-user');
      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to parse user from sessionStorage", error);
      sessionStorage.removeItem('lyra-user');
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    sessionStorage.setItem('lyra-user', JSON.stringify(userData));
    setUser(userData);
    if (userData.role === 'teacher') {
      router.push('/teacher');
    } else {
      router.push('/');
    }
  };

  const logout = () => {
    sessionStorage.removeItem('lyra-user');
    setUser(null);
    router.push('/login');
  };
  
  useEffect(() => {
    if (!loading && !user && pathname !== '/login' && pathname !== '/about') {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
