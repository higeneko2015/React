import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { AuthUser } from 'common';

export interface AppAuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (id: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AppAuthContext = createContext<AppAuthContextType | null>(null);

const MOCK_USER: AuthUser = {
  id: 'admin',
  name: '英行',
  roles: ['admin'],
  permissions: [
    'employee:read',
    'employee:create',
    'employee:edit',
    'employee:delete',
    'department:manage',
    'attendance:read',
    'payroll:read',
    'settings:manage',
  ],
};

const STORAGE_KEY = 'app1_auth_session';

export const AppAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初回ロード時に localStorage からセッションを復元
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsInitialized(true);
  }, []);

  const login = async (id: string, pass: string) => {
    // 擬似的なネットワーク遅延
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (id === 'admin' && pass === 'password') {
      setUser(MOCK_USER);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_USER));
    } else {
      throw new Error('IDまたはパスワードが間違っています。');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const contextValue = useMemo<AppAuthContextType>(
    () => ({
      isAuthenticated: !!user,
      user,
      login,
      logout,
    }),
    [user]
  );

  if (!isInitialized) {
    return null; // 初期化完了までは何も描画しない（チラつき防止）
  }

  return (
    <AppAuthContext.Provider value={contextValue}>
      {children}
    </AppAuthContext.Provider>
  );
};

export const useAppAuth = () => {
  const context = useContext(AppAuthContext);
  if (!context) {
    throw new Error('useAppAuth must be used within an AppAuthProvider');
  }
  return context;
};
