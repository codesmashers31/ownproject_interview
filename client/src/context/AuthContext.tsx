import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from '../lib/axios';


export interface User {
  id?: string;
  _id?: string;
  userId?: string;
  email: string;
  userType: string;
  name?: string;
  profileImage?: string;
  phone?: string;
  personalInfo?: {
    phone?: string;
    city?: string;
    state?: string;
    country?: string;
    bio?: string;
  };
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, userType: string, name: string, googleId?: string) => Promise<void>;
  googleLogin: (token: string) => Promise<any>;
  logout: () => void;
  isLoading: boolean;
  fetchProfile: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

interface Props { children: ReactNode; }

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // Initialize loading based on whether we think the user is logged in
  // Start with loading as true to ensure we check auth before rendering any protected routes
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Attach token to axios defaults if present
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Refresh Token Function
  const refreshAccessToken = async () => {
    try {
      const response = await axios.get('/api/auth/refresh');
      const { accessToken } = response.data;
      setToken(accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      return accessToken;
    } catch (error) {
      setToken(null);
      setUser(null);
      localStorage.removeItem('isLoggedIn'); // Clear hint if refresh fails
      throw error;
    }
  };

  // Global axios response interceptor — handle 401
  useEffect(() => {
    const id = axios.interceptors.response.use(
      (res) => res,
      async (err) => {
        const originalRequest = err.config;

        // If error is 401 and we haven't retried yet
        if (err.response?.status === 401 && !originalRequest._retry) {

          // IMPORTANT: Prevent infinite loop. If the error comes from the refresh endpoint itself, do NOT retry.
          if (originalRequest.url?.includes('/auth/refresh')) {
            return Promise.reject(err);
          }

          originalRequest._retry = true;

          try {
            const newToken = await refreshAccessToken();
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(id);
  }, []);

  // Check auth status on app load (Silent Login)
  useEffect(() => {
    const init = async () => {
      const isLoggedInHint = localStorage.getItem('isLoggedIn');
      
      if (!isLoggedInHint) {
        setIsLoading(false);
        return;
      }

      try {
        await refreshAccessToken(); // First try to get a fresh token using cookie
        await fetchProfile(); // Then fetch user profile
      } catch (e) {
        // Not logged in or expired
        setToken(null);
        setUser(null);
        localStorage.removeItem('isLoggedIn');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const fetchProfile = async (): Promise<User | null> => {
    try {
      const response = await axios.get('/api/auth/profile');
      const userData: User = response.data.user;

      let expertData: any = {};
      if (userData.userType === 'expert') {
        try {
          // Fetch expert profile to get specific photo if needed
          const expertRes = await axios.get('/api/expert/profile');
          if (expertRes.data?.success) {
            expertData = expertRes.data.profile || {};
          }
        } catch (e) {
          console.warn('Failed to fetch expert extra details', e);
        }
      }

      // Normalize userId or _id to id for consistency
      const normalizedUser: User = {
        ...userData,
        id: userData.userId || (userData as any)._id || userData.id,
        phone: userData.personalInfo?.phone || (userData as any).phone || userData.phone,
        // Prefer expert photo if available, otherwise fallback
        profileImage: expertData.photoUrl || userData.profileImage || (userData as any).photoUrl,
        role: userData.userType || (userData as any).role,
      };

      setUser(normalizedUser);
      return normalizedUser;
    } catch (error: any) {
      console.error('Failed to fetch profile', error);
      return null;
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { accessToken, user: userData } = response.data;

      if (!accessToken || !userData) throw new Error('Invalid response from server');

      setToken(accessToken);
      localStorage.setItem('isLoggedIn', 'true'); // Set auth hint

      // Normalize userId to id for consistency
      const normalizedUser: User = {
        ...userData,
        id: userData.userId || userData.id,
        phone: (userData as any).personalInfo?.phone || (userData as any).phone || userData.phone,
        role: userData.userType || (userData as any).role,
      };

      setUser(normalizedUser);
      return normalizedUser;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Login failed';
      throw new Error(msg);
    }
  };

  const googleLogin = async (token: string): Promise<any> => {
    try {
      // Using /google-signup endpoint which handles both login (if exists) and verification (if new)
      const response = await axios.post('/api/auth/google-signup', { token });
      const { exists, accessToken, user: userData, googleData } = response.data;

      if (exists && accessToken && userData) {
        setToken(accessToken);
        localStorage.setItem('isLoggedIn', 'true');

        // Normalize userId to id for consistency
        const normalizedUser: User = {
          ...userData,
          id: userData.userId || userData.id,
          phone: (userData as any).personalInfo?.phone || (userData as any).phone || userData.phone,
          role: userData.userType || (userData as any).role,
        };

        setUser(normalizedUser);
        return { success: true, user: normalizedUser };
      } else {
        return { success: false, googleData };
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Google Auth failed');
    }
  };

  const register = async (email: string, password: string, userType: string, name: string, googleId?: string) => {
    try {
      const res = await axios.post('/api/auth/register', { email, password, userType, name, googleId });

      const { accessToken, user: userData } = res.data;

      if (accessToken && userData) {
        setToken(accessToken);
        localStorage.setItem('isLoggedIn', 'true');

        // Normalize userId to id for consistency
        const normalizedUser: User = {
          ...userData,
          id: userData.userId || userData.id,
          phone: (userData as any).personalInfo?.phone || (userData as any).phone || userData.phone,
          role: userData.userType || (userData as any).role,
        };

        setUser(normalizedUser);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('isLoggedIn'); // Clear auth hint
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const value: AuthContextType = { user, token, login, googleLogin, register, logout, isLoading, fetchProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
