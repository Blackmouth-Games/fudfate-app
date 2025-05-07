import React, { createContext, useContext, useState } from 'react';
import { UserData } from '@/types/walletTypes';

const UserContext = createContext<{
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
}>({
  userData: null,
  setUserData: () => {},
});

export const useUserContext = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
}; 