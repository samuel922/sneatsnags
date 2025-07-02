import { apiClient } from './api';
import type { AuthResponse } from '../types/auth';

declare global {
  interface Window {
    google?: any;
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

export interface GoogleLoginResponse {
  credential: string;
}

export interface FacebookLoginResponse {
  accessToken: string;
  userID: string;
  status: string;
}

export const socialAuthService = {
  // Initialize Google OAuth
  async initializeGoogleAuth(): Promise<void> {
    return new Promise((resolve) => {
      if (window.google) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
          callback: (response: GoogleLoginResponse) => {
            socialAuthService.handleGoogleSignIn(response);
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        resolve();
      };
      document.head.appendChild(script);
    });
  },

  // Handle Google Sign-In
  async handleGoogleSignIn(response: GoogleLoginResponse): Promise<void> {
    try {
      const authResponse = await apiClient.post<AuthResponse>('/auth/google', {
        credential: response.credential,
      });

      if (authResponse.success && authResponse.data) {
        localStorage.setItem('accessToken', authResponse.data.tokens.accessToken);
        localStorage.setItem('refreshToken', authResponse.data.tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(authResponse.data.user));
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  },

  // Trigger Google Sign-In
  async signInWithGoogle(): Promise<void> {
    await this.initializeGoogleAuth();
    
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to popup
          const buttonElement = document.getElementById('google-signin-button');
          if (buttonElement && window.google?.accounts?.id) {
            window.google.accounts.id.renderButton(
              buttonElement,
              {
                theme: 'outline',
                size: 'large',
                width: '100%',
              }
            );
          }
        }
      });
    }
  },

  // Initialize Facebook SDK
  async initializeFacebookAuth(): Promise<void> {
    return new Promise((resolve) => {
      if (window.FB) {
        resolve();
        return;
      }

      window.fbAsyncInit = () => {
        window.FB!.init({
          appId: import.meta.env.VITE_FACEBOOK_APP_ID || '',
          cookie: true,
          xfbml: true,
          version: 'v18.0',
        });
        resolve();
      };

      // Load Facebook SDK
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    });
  },

  // Sign in with Facebook
  async signInWithFacebook(): Promise<void> {
    await this.initializeFacebookAuth();

    return new Promise((resolve, reject) => {
      if (!window.FB) {
        reject(new Error('Facebook SDK not loaded'));
        return;
      }
      
      window.FB!.login(
        async (response: FacebookLoginResponse) => {
          if (response.status === 'connected') {
            try {
              const authResponse = await apiClient.post<AuthResponse>('/auth/facebook', {
                accessToken: response.accessToken,
                userID: response.userID,
              });

              if (authResponse.success && authResponse.data) {
                localStorage.setItem('accessToken', authResponse.data.tokens.accessToken);
                localStorage.setItem('refreshToken', authResponse.data.tokens.refreshToken);
                localStorage.setItem('user', JSON.stringify(authResponse.data.user));
                
                // Redirect to dashboard
                window.location.href = '/dashboard';
                resolve();
              }
            } catch (error) {
              console.error('Facebook login failed:', error);
              reject(error);
            }
          } else {
            reject(new Error('Facebook login was cancelled or failed'));
          }
        },
        { scope: 'email,public_profile' }
      );
    });
  },

  // Get Facebook login status
  async getFacebookLoginStatus(): Promise<any> {
    await this.initializeFacebookAuth();
    
    return new Promise((resolve) => {
      if (!window.FB) {
        resolve({ status: 'unknown' });
        return;
      }
      
      window.FB!.getLoginStatus((response: any) => {
        resolve(response);
      });
    });
  },

  // Logout from Facebook
  async logoutFromFacebook(): Promise<void> {
    await this.initializeFacebookAuth();
    
    return new Promise((resolve) => {
      if (!window.FB) {
        resolve();
        return;
      }
      
      window.FB!.logout(() => {
        resolve();
      });
    });
  },
};