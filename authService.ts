import { User } from './types';
import * as LocalStorageService from './localStorageService';
import * as ApiService from './apiService'; // Assuming apiService.ts is created

export const signUp = async (name: string, email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    const response = await ApiService.request<{ user: User; token: string }>('/api/auth/signup', 'POST', { name, email, password }, false);
    if (response.token && response.user) {
      LocalStorageService.saveAuthToken(response.token);
      return { success: true, message: 'Sign up successful! Please sign in.', user: response.user };
    }
    // Fallback if response structure is not as expected but request didn't throw
    return { success: false, message: response.message || 'Sign up failed due to an unexpected response from the server.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Sign up failed. Please try again.' };
  }
};

export const signIn = async (email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    const response = await ApiService.request<{ user: User; token: string; message?: string }>('/api/auth/signin', 'POST', { email, password }, false);
    if (response.token && response.user) {
      LocalStorageService.saveAuthToken(response.token);
      return { success: true, message: 'Sign in successful!', user: response.user };
    }
    return { success: false, message: response.message || 'Sign in failed due to an unexpected server response.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Sign in failed. Please check your credentials.' };
  }
};

export const signOut = async (): Promise<void> => {
  const token = LocalStorageService.loadAuthToken();
  if (token) {
    try {
      // Optionally notify the backend that the user is signing out
      await ApiService.request('/api/auth/signout', 'POST', {}, true);
    } catch (error) {
      // Log error but proceed with client-side sign out
      console.error("Error notifying server of sign out:", error);
    }
  }
  LocalStorageService.removeAuthToken();
};

export const getCurrentUser = async (): Promise<User | null> => {
  const token = LocalStorageService.loadAuthToken();
  if (!token) {
    return null;
  }
  try {
    // Validate token with the server and get fresh user data
    const response = await ApiService.request<{ user: User }>('/api/auth/me', 'GET', null, true);
    return response.user;
  } catch (error: any) {
    console.warn("Session validation failed or token expired:", error.message);
    LocalStorageService.removeAuthToken(); // Token is invalid or expired
    return null;
  }
};
