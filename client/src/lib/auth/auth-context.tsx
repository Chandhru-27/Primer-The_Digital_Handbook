  import { createContext, useState, useEffect, ReactNode, Dispatch, SetStateAction, useContext } from "react";
  import api from "../api/axios";

  type AuthContextType = {
    isLoggedIn: boolean;
    setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
  };

  const AuthContext = createContext<AuthContextType | undefined>(undefined);

  export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
      api
        .get("/auth/me")
        .then(() => setIsLoggedIn(true))
        .catch(() => setIsLoggedIn(false));
    }, []);

    return (
      <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
        {children}
      </AuthContext.Provider>
    );
  };

  export const useAuthForContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  };
