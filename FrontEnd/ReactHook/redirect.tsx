"use client";

import { useRouter } from "next/navigation";
import { supabase } from "../../supabase/lib/supabase";

export interface Redirect {
  LoginPush?: string;
}

export default function MoveTo(options?: Redirect) {
  const router = useRouter();
  const redirectPath = options?.LoginPush || "/";

  const handleRedirect = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Auth error:", authError);
        router.push("/login");
        return;
      }

      // User is authenticated, redirect to specified path
      router.push(redirectPath);
    } catch (err) {
      console.error("Unexpected error:", err);
      router.push("/login");
    }
  };

  return { handleRedirect };
}