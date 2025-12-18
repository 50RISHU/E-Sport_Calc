import { createClient } from '@supabase/supabase-js'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'

// 1. Check if we are in the browser
const isBrowser = typeof window !== 'undefined'

// 2. Configure the client to handle Server-Side Rendering (SSR)
export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
  auth: {
    // Only persist the session if we are in the browser!
    persistSession: isBrowser,
    autoRefreshToken: isBrowser,
    detectSessionInUrl: isBrowser
  }
})

