import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import api from "../api/config";

import { jwtDecode } from "jwt-decode";
import LocalStorageService from "../utils/localstorage";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedin] = useState(false);

  /**
   *
   * @param {object} userData - for login data
   * @param {string} userData.phoneNumber - phone number
   * @param {string} userData.password - password
   */
  const login = async (userData) => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/zone/login-zone-manager", {
        phoneNumber: userData.phoneNumber,
        password: userData.password,
      });

      if (data.success) {
        localStorage.setItem("accessToken", data.result.accessToken);
        localStorage.setItem("userId", data.result.user._id);
        setIsLoggedin(true);
        setUser(data.result.user);
      }
    } catch (error) {
      setIsLoggedin(false);
      console.log(error.response);
    } finally {
      setIsLoading(false);
    }
  };

  //   check is logged in
  useEffect(() => {
    async function handleFetchUser() {
      setIsLoading(true);
      const AccessToken = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");
      if (!AccessToken) {
        setIsLoggedin(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await api.get(`/zone/profile/${userId}`, {
          headers: {
            AccessToken: AccessToken,
          },
        });
        if (data.success) {
          setUser(data.result);
          setIsLoggedin(true);
        } else {
          localStorage.removeItem("accessToken");
          setIsLoggedin(false);
        }
      } catch (error) {
        console.log(error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userId");
        setIsLoggedin(false);
      } finally {
        setIsLoading(false);
      }
    }

    handleFetchUser();
  }, []);

  const logout = () => {
    setIsLoggedin(false);
  };

  const authValues = {
    user,
    isLoading,
    isLoggedIn,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authValues}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
