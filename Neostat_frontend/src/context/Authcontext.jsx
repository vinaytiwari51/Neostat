
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = Boolean(user);

  // Verify the saved token when the application starts
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");

        const authenticatedUser = response.data?.data?.user;

        if (!authenticatedUser) {
          throw new Error("Invalid user response.");
        }

        setUser(authenticatedUser);
      } catch (error) {
        console.error("Authentication verification failed:", error);

        localStorage.removeItem("accessToken");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  // Signup
  const signup = async (userData) => {
    try {
      const response = await api.post(
        "/auth/signup",
        userData
      );

      const { user: registeredUser, token } =
        response.data.data;

      if (!registeredUser || !token) {
        throw new Error("Invalid signup response.");
      }

      localStorage.setItem("accessToken", token);

      setUser(registeredUser);

      return registeredUser;
    } catch (error) {
      throw error;
    }
  };

  // Login
  const login = async (credentials) => {
    try {
      const response = await api.post(
        "/auth/login",
        credentials
      );

      const { user: loggedInUser, token } =
        response.data.data;

      if (!loggedInUser || !token) {
        throw new Error("Invalid login response.");
      }

      // Save JWT token
      localStorage.setItem("accessToken", token);

      // Update authenticated user
      setUser(loggedInUser);

      return loggedInUser;
    } catch (error) {
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Local logout should still work if the server is unavailable
      console.error("Logout API error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
    }
  };

  // Update local user information
  const updateUser = (updatedUser) => {
    setUser((currentUser) => ({
      ...currentUser,
      ...updatedUser,
    }));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    signup,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};
