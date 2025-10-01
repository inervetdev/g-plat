import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient2() {
  const cookieStore = await cookies()

  return createServerClient(
    'https://anwwjowwrxdygqyhhckr.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3dqb3d3cnhkeWdxeWhoY2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODg0OTUsImV4cCI6MjA3NDU2NDQ5NX0.uKtcf8jpHuY6JYb2i3bKhmCayvecc4Ezf6go5Luh5gs',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
