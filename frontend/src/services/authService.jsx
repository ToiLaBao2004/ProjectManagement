// API Base URL
const API_BASE_URL = 'http://localhost:4000';

// Auth API Service
export const authAPI = {
  // Sign Up
  signup: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Login
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Google Login
  googleLogin: () => {
    // Redirect to Google OAuth
    window.location.href = `${API_BASE_URL}/auth/google`;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Save user data to localStorage
  saveUserData: (userData) => {
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
    if (userData.user) {
      localStorage.setItem('user', JSON.stringify(userData.user));
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }
};

// Helper function for authenticated requests
export const createAuthenticatedRequest = (endpoint, options = {}) => {
  const token = authAPI.getToken();
  
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });
};

export default authAPI;