'use client';

import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface GoogleSignInButtonProps {
  mode: 'login' | 'signup';
  onError?: (error: string) => void;
  country?: string;
}

export default function GoogleSignInButton({ mode, onError, country }: GoogleSignInButtonProps) {
  const router = useRouter();
  const { googleAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      onError?.('No credential received from Google');
      return;
    }

    setLoading(true);
    try {
      await googleAuth(credentialResponse.credential, country);
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Google sign-in failed. Please try again.';
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleError = () => {
    onError?.('Google sign-in was cancelled or failed. Please try again.');
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center py-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
          Signing in with Google...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        text={mode === 'signup' ? 'signup_with' : 'signin_with'}
        shape="rectangular"
        width="400"
        theme="outline"
        size="large"
      />
    </div>
  );
}
