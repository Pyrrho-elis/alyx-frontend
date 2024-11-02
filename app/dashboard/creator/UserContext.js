import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from "@/app/hooks/useUser";
import { useCreator } from "@/app/hooks/useCreator";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const { user, logout } = useUser();
    const { creator, loading } = useCreator({ username: user?.user_metadata.username });

    return (
        <UserContext.Provider value={{ user, logout, creator, loading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => useContext(UserContext);