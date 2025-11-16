"use client"

import { supabase } from "../../supabase/lib/supabase";
import { useRouter } from "next/navigation";

export interface Redirect {
    LoginPush?: string;
}

export default function MoveTo (options?: Redirect){
    const router = useRouter();
    const page = options?.LoginPush || "/"

    const handleFindNow = async () => {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            
            if(authError || !user) {
            console.error('Auth error:', authError);
            router.push("/login");
            return;
            }
            
            router.push(page);
        } catch (err) {
            console.error('Unexpected error:', err);
            router.push("/login");
        }
    };
    return {handleFindNow}
}