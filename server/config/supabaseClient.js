import { createClient } from '@supabase/supabase-js';
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey,
    {
        auth: {
            flowType: 'pkce', // This forces Supabase to send a 'code' instead of a hash
        }
    }
);

export default supabase;
