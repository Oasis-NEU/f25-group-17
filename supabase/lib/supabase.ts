import 'dotenv/config';
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types.ts"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

if (!supabaseUrl || !supabaseKey){
    throw new Error('Missing Supabase environment variables.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
