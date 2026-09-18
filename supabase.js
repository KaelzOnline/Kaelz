// Public/publishable Supabase key is safe to use in frontend.
// NEVER use a service_role/secret key here.
const SUPABASE_URL = "https://zlfilzrgrjwxmtnwmepr.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ey4M8lCA0JJwWjUzM1EDwg_Re9feYI7";

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
