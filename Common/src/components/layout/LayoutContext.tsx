import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface LayoutContextType {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children, defaultCollapsed = false }: { children: ReactNode, defaultCollapsed?: boolean }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(defaultCollapsed);
  const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);
  
  return (
    <LayoutContext.Provider value={{ isSidebarCollapsed, toggleSidebar }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider. Make sure CompanyHeader and CompanySidebar are used inside CompanyAppShell.');
  }
  return context;
};
