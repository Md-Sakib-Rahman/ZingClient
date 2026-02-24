import { useState, useEffect } from "react";
import axiosInstance from "../Api/publicAxios/axiosInstance";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    
    if (!refreshToken) {
      setLoading(false);
      return;
    }

    try {
      // Logic: Using the refresh token to get a new access token
      const res = await axiosInstance.post("auth/refresh/", {
        refresh_token: refreshToken,
      });

      // Mapping keys based on your Django backend response
      const newAccess = res.data.access_token;
      localStorage.setItem("token", newAccess);
      setAccessToken(newAccess);
      setUser(res.data.user);
    } catch (err) {
      console.error("Auth: Session expired or invalid refresh token");
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true)
    refreshSession();
  }, []);

  const logout = () => {
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user"); // Clean up local user cache if any
    localStorage.removeItem("token");
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, setAccessToken, logout, loading, refreshSession, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};