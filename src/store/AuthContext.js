import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { me } from "../api/auth";

export const AuthContext = createContext();

const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return true;
    return decoded.exp < Date.now() / 1000;
  } catch (error) {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (token && !isTokenExpired(token)) {
        // Optionally, fetch user info from backend
        try {
          const { user } = await me(token);
          setUserToken(token);
          setUser(user);
          await AsyncStorage.setItem("user", JSON.stringify(user));
        } catch (error) {
          setUserToken(null);
          setUser(null);
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("user");
        }
      } else {
        setUserToken(null);
        setUser(null);
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
      }
      setIsLoading(false);
    };
    checkToken();
  }, []);

  const login = async (token, userData) => {
    setIsLoading(true);
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("user", JSON.stringify(userData));
    setUserToken(token);
    setUser(userData);
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setUserToken(null);
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ isLoading, userToken, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
