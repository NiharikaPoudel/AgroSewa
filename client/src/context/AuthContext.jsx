import { createContext, useEffect, useState } from "react";
import api from "../utils/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [userInitial, setUserInitial] = useState("");

  const checkAuth = async () => {
    try {
      const res = await api.post("/auth/is-auth");
      if (res.data.success) {
        setIsAuth(true);
        const userRes = await api.get("/user/data");
        setUserInitial(userRes.data.userData.name[0].toUpperCase());
      } else {
        setIsAuth(false);
      }
    } catch {
      setIsAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuth, setIsAuth, userInitial }}>
      {children}
    </AuthContext.Provider>
  );
};
