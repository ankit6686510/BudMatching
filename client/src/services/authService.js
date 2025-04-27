import axios from 'axios';
import api from './api';

// Save token to local storage
const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Remove token from local storage
const removeToken = () => {
  localStorage.removeItem('token');
};

// Check if user is authenticated
export const checkAuth = async () => {
  try {
    // Check for token first
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }
    
    const response = await api.get('/api/auth/verify');
    return response.data;
  } catch (error) {
    console.error('Auth verification error:', error);
    // If auth check fails, clear the token
    removeToken();
    return null;
  }
};

// Login user
export const login = async (credentials) => {
  try {
    const response = await api.post('/api/auth/login', credentials);
    
    // Save token on successful login
    if (response.data.token) {
      setToken(response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    
    if (error.response && error.response.data) {
      throw { message: error.response.data.message || 'Login failed' };
    }
    
    throw { message: 'Login failed. Please check your connection and try again.' };
  }
};

// Register user
export const register = async (userData) => {
  try {
    const response = await api.post('/api/auth/register', userData);
    
    // Save token on successful registration
    if (response.data.token) {
      setToken(response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.response && error.response.data) {
      throw { message: error.response.data.message || 'Registration failed' };
    }
    
    throw { message: 'Registration failed. Please check your connection and try again.' };
  }
};

// Logout user
export const logout = () => {
  removeToken();
};

// Update user profile
export const updateProfile = async (userData) => {
  try {
    const response = await api.put('/api/users/profile', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Profile update failed' };
  }
};

// Change password
export const changePassword = async (passwordData) => {
  try {
    const response = await api.put('/api/users/password', passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Password change failed' };
  }
};

// Request password reset
export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Forgot password request failed' };
  }
};

// Reset password
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post('/api/auth/reset-password', { 
      token, 
      password: newPassword 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Password reset failed' };
  }
};

// Get user profile
export const getProfile = async () => {
  try {
    const response = await api.get('/api/users/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch profile' };
  }
};

// Update profile picture
export const updateProfilePicture = async (pictureData) => {
  try {
    const response = await api.put('/api/users/profile/picture', pictureData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update profile picture' };
  }
}; 