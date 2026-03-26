import React, { createContext, useContext } from 'react';

const InGridContext = createContext<boolean>(false);

export const InGridProvider = ({ children, value = true }: { children: React.ReactNode, value?: boolean }) => (
  <InGridContext.Provider value={value}>{children}</InGridContext.Provider>
);

export const useInGrid = () => useContext(InGridContext);