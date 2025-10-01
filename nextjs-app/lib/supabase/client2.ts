import { createBrowserClient } from '@supabase/ssr'

export function createClient2() {
  return createBrowserClient(
    'https://anwwjowwrxdygqyhhckr.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3dqb3d3cnhkeWdxeWhoY2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODg0OTUsImV4cCI6MjA3NDU2NDQ5NX0.uKtcf8jpHuY6JYb2i3bKhmCayvecc4Ezf6go5Luh5gs'
  )
}
