// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// These come from your .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a reusable client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
