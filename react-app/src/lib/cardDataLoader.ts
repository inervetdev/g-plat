// Shared card data loading logic for all theme components
import { supabase } from './supabase'

export interface CardData {
  id?: string
  name: string
  name_en?: string
  title: string
  company: string
  department?: string
  phone: string
  email: string
  website?: string
  address?: string
  address_detail?: string
  latitude?: number
  longitude?: number
  linkedin?: string
  instagram?: string
  facebook?: string
  twitter?: string
  youtube?: string
  github?: string
  tiktok?: string
  threads?: string
  introduction?: string
  services?: string[]
  skills?: string[]
  profileImage?: string
  profile_image_url?: string
  company_logo_url?: string
  attachment_title?: string
  attachment_url?: string
  attachment_filename?: string
}

export async function loadBusinessCardData(userId: string): Promise<CardData | null> {
  try {
    // First try to load from business_cards table
    const { data: businessCard, error: cardError } = await supabase
      .from('business_cards')
      .select('*')
      .or(`id.eq.${userId},user_id.eq.${userId},custom_url.eq.${userId}`)
      .eq('is_active', true)
      .single()

    if (businessCard && !cardError) {
      const cardData = businessCard as any
      return {
        id: cardData.id,
        name: cardData.name,
        name_en: cardData.name_en || '',
        title: cardData.title || '',
        company: cardData.company || '',
        department: cardData.department || '',
        phone: cardData.phone || '',
        email: cardData.email || '',
        website: cardData.website || '',
        address: cardData.address || '',
        address_detail: cardData.address_detail || '',
        latitude: cardData.latitude,
        longitude: cardData.longitude,
        linkedin: cardData.linkedin || '',
        instagram: cardData.instagram || '',
        facebook: cardData.facebook || '',
        twitter: cardData.twitter || '',
        youtube: cardData.youtube || '',
        github: cardData.github || '',
        tiktok: cardData.tiktok || '',
        threads: cardData.threads || '',
        introduction: cardData.introduction || '',
        services: cardData.services || [],
        skills: cardData.skills || [],
        profileImage: cardData.profile_image_url || cardData.profile_image || '',
        attachment_title: cardData.attachment_title || '',
        attachment_url: cardData.attachment_url || '',
        attachment_filename: cardData.attachment_filename || ''
      }
    }

    // Fallback to user data
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (userData) {
      const profile = profileData as any
      return {
        name: userData.name || '이름',
        name_en: '',
        title: profile?.title || '직책',
        company: profile?.company || '회사',
        department: '',
        phone: (userData as any).phone || '010-0000-0000',
        email: userData.email || 'email@example.com',
        website: profile?.website || '',
        address: '',
        linkedin: '',
        instagram: '',
        facebook: '',
        twitter: '',
        youtube: '',
        github: '',
        tiktok: '',
        threads: '',
        introduction: profile?.introduction || '',
        services: profile?.services || [],
        skills: [],
        profileImage: profile?.profile_image || ''
      }
    }

    return null
  } catch (error) {
    console.error('Error loading card data:', error)
    return null
  }
}

// Default demo data
export const defaultDemoData: CardData = {
  name: '김대리',
  name_en: 'Dae-ri Kim',
  title: 'Full Stack Developer',
  company: 'G-PLAT Tech',
  department: '개발팀',
  phone: '010-1234-5678',
  email: 'demo@gplat.com',
  website: 'https://gplat.com',
  address: '서울시 강남구',
  linkedin: '',
  instagram: '',
  facebook: '',
  twitter: '',
  youtube: '',
  github: '',
  tiktok: '',
  threads: '',
  introduction: '안녕하세요! 풀스택 개발자입니다. React, Node.js, TypeScript를 주로 사용하며, 모바일 명함 서비스를 개발하고 있습니다.',
  services: ['웹 개발', '앱 개발', 'UI/UX 디자인', '기술 컨설팅'],
  skills: ['React', 'Node.js', 'TypeScript'],
  profileImage: ''
}