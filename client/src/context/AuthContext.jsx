import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    const handleLogout = () => {
      logout(false);
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const initializeAuth = () => {
    try {
      const token = authService.getToken();
      const storedUser = authService.getUserData();

      if (token && storedUser) {
        setUser(storedUser);
        setIsAuthenticated(true);
        console.log('✅ Auth initialized');
      }
    } catch (error) {
      console.error('❌ Auth init error:', error);
      authService.clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    return authService.register(userData);
  };

  const verifyOTP = async (email, otp) => {
    const data = await authService.verifyOTP(email, otp);

    if (!data?.user || !data?.token) {
      throw new Error('OTP verification failed');
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    const storedToken = authService.getToken();

    if (!storedToken) {
      console.error('❌ Token not stored properly!');
      throw new Error('Token storage failed');
    }

    setUser(data.user);
    setIsAuthenticated(true);
    console.log('✅ OTP verified, user set');

    return data;
  };

  const resendOTP = async (email) => {
    return authService.resendOTP(email);
  };

  const login = async (email, password) => {
    const data = await authService.login(email, password);

    if (!data?.user || !data?.token) {
      throw new Error('Login failed');
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    const storedToken = authService.getToken();

    if (!storedToken) {
      console.error('❌ Token not stored properly!');
      throw new Error('Token storage failed');
    }

    setUser(data.user);
    setIsAuthenticated(true);
    console.log('✅ Login complete, state updated');

    return data;
  };

  const logout = (notifyBackend = true) => {
    if (notifyBackend) {
      authService.logout();
    } else {
      authService.clearAuthData();
    }

    setUser(null);
    setIsAuthenticated(false);
    console.log('🔴 Logged out');
  };
  const refreshUser = async () => {
    try {
      const updatedUser = await authService.refreshUser();
      setUser(updatedUser);
    } catch (err) {
      console.error('Failed to refresh user', err);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    authService.setUserData(updatedUser);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      register,
      verifyOTP,
      resendOTP,
      refreshUser,
      login,
      logout,
      updateUser
    }),
    [user, loading, isAuthenticated]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
