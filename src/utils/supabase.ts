// Import createClient from the official Supabase JavaScript SDK
import { createClient } from '@supabase/supabase-js';

// The project REST API endpoint URL for the hosted Supabase PostgreSQL database
const SUPABASE_URL = 'https://xkcqprwwwrfnqjyozual.supabase.co';

// The public anonymous API key allowing frontend visitors to read and insert public community notes
const SUPABASE_ANON_KEY = 'sb_publishable_Ajgx7ubOBdT9O_ZjGF_YjA_t5Dn-ggk';

// Instantiate and export the reusable Supabase database client for real-time listeners and RPC functions
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);