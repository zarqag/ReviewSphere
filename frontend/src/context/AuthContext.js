import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("rsUser")) || null,
  );
  const [token, setToken] = useState(
    () => localStorage.getItem("rsToken") || null,
  );

  const login = (userData, tkn) => {
    setUser(userData);
    setToken(tkn);
    localStorage.setItem("rsUser", JSON.stringify(userData));
    localStorage.setItem("rsToken", tkn);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("rsUser");
    localStorage.removeItem("rsToken");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
