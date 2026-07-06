import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../../context/AuthContext';

const OAuth2RedirectHandler: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        login(token, user);
        navigate('/dashboard');
      } catch (error) {
        console.error("Failed to parse user from OAuth redirect", error);
        navigate('/login?error=oauth_failed');
      }
    } else {
      navigate('/login?error=oauth_missing_params');
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="flex h-screen items-center justify-center bg-background text-white">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-text-secondary">Authenticating...</p>
      </div>
    </div>
  );
};

export default OAuth2RedirectHandler;
