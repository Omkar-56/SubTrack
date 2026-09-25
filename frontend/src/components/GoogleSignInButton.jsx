import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function GoogleSignInButton({ text = 'signin_with', onError }) {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const btnContainerRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [clientId, setClientId] = useState('');

  useEffect(() => {
    const gClientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      window.__GOOGLE_CLIENT_ID__ ||
      '';
    setClientId(gClientId);

    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }

    const scriptId = 'google-gis-script';
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => {
        if (onError) onError('Failed to load Google Sign-In SDK');
      };
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => setScriptLoaded(true));
    }
  }, [onError]);

  useEffect(() => {
    if (!scriptLoaded || !window.google?.accounts?.id || !clientId || !btnContainerRef.current) {
      return;
    }

    async function handleCredentialResponse(response) {
      try {
        await loginWithGoogle(response.credential);
        navigate('/dashboard');
      } catch (err) {
        if (onError) onError(err.message || 'Google sign-in failed');
      }
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      btnContainerRef.current.innerHTML = '';

      window.google.accounts.id.renderButton(btnContainerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: text,
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 384,
      });
    } catch (err) {
      console.error('Google button init error:', err);
    }
  }, [scriptLoaded, clientId, text, loginWithGoogle, navigate, onError]);

  if (!clientId) {
    return (
      <button
        type="button"
        onClick={() => {
          const promptClientId = window.prompt(
            'To enable Google Sign-In, please set VITE_GOOGLE_CLIENT_ID in your frontend .env file.\n\nOr enter your Google Client ID here to test immediately:'
          );
          if (promptClientId && promptClientId.trim()) {
            window.__GOOGLE_CLIENT_ID__ = promptClientId.trim();
            setClientId(promptClientId.trim());
          }
        }}
        className="w-full flex items-center justify-center gap-3 rounded-sm border border-line bg-white px-4 py-2 text-sm font-medium text-ink shadow-2xs hover:bg-stone-50 transition-colors cursor-pointer"
        title="Google OAuth Client ID required"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div ref={btnContainerRef} className="w-full flex justify-center" />
    </div>
  );
}
