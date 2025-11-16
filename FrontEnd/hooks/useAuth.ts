import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/lib/supabase';

interface UseAuthReturn {
  isSignedIn: boolean;
  redirectPath: string;
  loading: boolean;
}

export function useAuth(defaultRedirectPath: string = "/signup"): UseAuthReturn {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [redirectPath, setRedirectPath] = useState(defaultRedirectPath);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setIsSignedIn(true);
          setRedirectPath("/profile");
        } else {
          setIsSignedIn(false);
          setRedirectPath(defaultRedirectPath);
        }
      } catch (err) {
        console.error("Auth check error:", err);
        setRedirectPath(defaultRedirectPath);
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
  }, [defaultRedirectPath]);

  return { isSignedIn, redirectPath, loading };
}
