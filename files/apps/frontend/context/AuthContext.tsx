import React, { createContext, useContext, useState, ReactNode } from "react";

type UserType = "admin" | "user";

type User = {
  id: string;
  email: string;
  name: string;
  type: UserType;
  token?: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string, type: UserType) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, type: UserType) => {
    // TODO: Call backend for login, set user
    setUser({ id: "1", email, name: "Demo User", type, token: "demo-token" });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};