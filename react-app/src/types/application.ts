// Product Application Types for React App (User-facing)
// 상품 신청 타입 정의 (사용자 화면용)

/**
 * 폼 필드 타입
 */
export type FormFieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'phone'
  | 'select'
  | 'checkbox'
  | 'textarea'
  | 'date';

/**
 * 폼 필드 유효성 검사 규칙
 */
export interface FormFieldValidation {
  pattern?: string;
  message?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
}

/**
 * 선택 옵션 (select 타입용)
 */
export interface FormFieldOption {
  value: string;
  label: string;
}

/**
 * 동적 폼 필드 스키마
 */
export interface FormFieldSchema {
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  options?: FormFieldOption[];
  validation?: FormFieldValidation;
  defaultValue?: string | number | boolean;
  helpText?: string;
}

/**
 * 신청 가능 템플릿 정보 (신청 폼용)
 */
export interface ApplicationTemplate {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: string | null;
  partner_name: string | null;
  category: string;
  form_schema: FormFieldSchema[];
  application_enabled: boolean;
  application_settings: ApplicationSettings;
}

/**
 * 신청 설정
 */
export interface ApplicationSettings {
  reward_type?: 'commission' | 'points' | 'none';
  reward_amount?: number;
  auto_assign?: string | null;
  notification_emails?: string[];
  duplicate_check?: boolean;
  duplicate_period_days?: number;
}

/**
 * 신청 제출 데이터
 */
export interface ApplicationSubmitData {
  template_id: string;
  instance_id?: string;
  referrer_card_url?: string;
  applicant_name: string;
  applicant_phone: string;
  applicant_email: string;
  form_data: Record<string, unknown>;
  privacy_agreed: boolean;
  device_type?: 'mobile' | 'tablet' | 'desktop';
}

/**
 * 신청 상태
 */
export type ApplicationStatus =
  | 'pending'     // 대기중
  | 'assigned'    // 담당자 배정됨
  | 'processing'  // 처리중
  | 'completed'   // 완료
  | 'cancelled';  // 취소

/**
 * 보상 상태
 */
export type RewardStatus = 'pending' | 'approved' | 'paid';

/**
 * 보상 유형
 */
export type RewardType = 'commission' | 'points' | 'none';

/**
 * 신청 결과 (제출 후 응답)
 */
export interface ApplicationResult {
  id: string;
  status: ApplicationStatus;
  created_at: string;
  message?: string;
}

/**
 * 내 신청 목록 (신청자 조회용)
 */
export interface MyApplication {
  id: string;
  template_id: string;
  template_title: string;
  template_image_url: string | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
}

/**
 * 추천인 신청 목록 (추천인 조회용)
 */
export interface ReferredApplication {
  id: string;
  template_id: string;
  template_title: string;
  applicant_name: string;
  status: ApplicationStatus;
  referrer_reward_type: RewardType | null;
  referrer_reward_amount: number;
  referrer_reward_status: RewardStatus;
  created_at: string;
}

/**
 * 상태 표시 설정
 */
export const APPLICATION_STATUS_CONFIG: Record<ApplicationStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  pending: { label: '대기중', color: '#f59e0b', bgColor: '#fef3c7' },
  assigned: { label: '배정됨', color: '#3b82f6', bgColor: '#dbeafe' },
  processing: { label: '처리중', color: '#8b5cf6', bgColor: '#ede9fe' },
  completed: { label: '완료', color: '#22c55e', bgColor: '#dcfce7' },
  cancelled: { label: '취소', color: '#6b7280', bgColor: '#f3f4f6' },
};

/**
 * 보상 상태 표시 설정
 */
export const REWARD_STATUS_CONFIG: Record<RewardStatus, {
  label: string;
  color: string;
}> = {
  pending: { label: '대기', color: '#f59e0b' },
  approved: { label: '승인', color: '#3b82f6' },
  paid: { label: '지급완료', color: '#22c55e' },
};
