import { createClient } from './client'
import { createClient2 } from './client2'
import { createClient as createServerClient } from './server'
import { createClient2 as createServerClient2 } from './server2'

// 클라이언트 사이드에서 사용할 수 있는 멀티 클라이언트
export const supabaseClients = {
  primary: createClient,
  secondary: createClient2,
}

// 서버 사이드에서 사용할 수 있는 멀티 클라이언트
export const supabaseServerClients = {
  primary: createServerClient,
  secondary: createServerClient2,
}

// 사용 예시:
// const primaryClient = supabaseClients.primary()
// const secondaryClient = supabaseClients.secondary()

