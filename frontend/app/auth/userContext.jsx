/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost:9999/auth/me", {
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser(); // 🔥 runs once on app load
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, fetchUser, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);