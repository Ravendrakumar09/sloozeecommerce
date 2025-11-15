import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check if environment variables are set
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase environment variables are not set. Using placeholder values.');
    // Return a client with placeholder values (will fail gracefully)
    return createBrowserClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseKey || 'placeholder-key'
    );
  }

  // Create a supabase client on the browser with project's credentials
  return createBrowserClient(supabaseUrl, supabaseKey);
}