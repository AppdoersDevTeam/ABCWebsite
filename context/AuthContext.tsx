import React, { createContext, useContext, useState, useEffect, ReactNode, PropsWithChildren } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren<{}>) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking session
    const timer = setTimeout(() => {
      // Intentionally left null to start on public side. 
      // Uncomment below to simulate logged in state.
      // setUser({ id: '1', email: 'member@church.com', name: 'John Doe', is_approved: true, role: 'member' });
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    // Simulate API call
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // Mock logic: emails containing "pending" will be unapproved
        const isApproved = !email.includes('pending');
        setUser({
          id: Math.random().toString(36).substr(2, 9),
          email,
          name: email.split('@')[0],
          is_approved: isApproved,
          role: 'member'
        });
        setIsLoading(false);
        resolve();
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};