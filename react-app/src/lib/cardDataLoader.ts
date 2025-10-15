// Shared card data loading logic for all theme components
import { supabase } from './supabase'

export interface CardData {
  id?: string
  name: string
  title: string
  company: string
  department?: string
  phone: string
  email: string
  website?: string
  address?: string
  linkedin?: string
  instagram?: string
  facebook?: string
  twitter?: string
  youtube?: string
  github?: string
  introduction?: string
  services?: string[]
  skills?: string[]
  profileImage?: string
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
      return {
        id: businessCard.id,
        name: businessCard.name,
        title: businessCard.title || '',
        company: businessCard.company || '',
        department: businessCard.department || '',
        phone: businessCard.phone || '',
        email: businessCard.email || '',
        website: businessCard.website || '',
        address: businessCard.address || '',
        linkedin: businessCard.linkedin || '',
        instagram: businessCard.instagram || '',
        facebook: businessCard.facebook || '',
        twitter: businessCard.twitter || '',
        youtube: businessCard.youtube || '',
        github: businessCard.github || '',
        introduction: businessCard.introduction || '',
        services: businessCard.services || [],
        skills: businessCard.skills || [],
        profileImage: businessCard.profile_image || '',
        attachment_title: businessCard.attachment_title || '',
        attachment_url: businessCard.attachment_url || '',
        attachment_filename: businessCard.attachment_filename || ''
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
      return {
        name: userData.name || '이름',
        title: profileData?.title || '직책',
        company: profileData?.company || '회사',
        department: '',
        phone: userData.phone || '010-0000-0000',
        email: userData.email || 'email@example.com',
        website: profileData?.website || '',
        address: '',
        linkedin: '',
        instagram: '',
        facebook: '',
        twitter: '',
        youtube: '',
        github: '',
        introduction: profileData?.introduction || '',
        services: profileData?.services || [],
        skills: [],
        profileImage: profileData?.profile_image || ''
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
  introduction: '안녕하세요! 풀스택 개발자입니다. React, Node.js, TypeScript를 주로 사용하며, 모바일 명함 서비스를 개발하고 있습니다.',
  services: ['웹 개발', '앱 개발', 'UI/UX 디자인', '기술 컨설팅'],
  skills: ['React', 'Node.js', 'TypeScript'],
  profileImage: ''
}