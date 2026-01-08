-- =====================================================
-- admin_sidejob_templates 테이블에 form_schema 컬럼 추가
-- 상품별 동적 폼 필드 정의를 위한 JSON 스키마
-- =====================================================

-- form_schema 컬럼 추가
ALTER TABLE public.admin_sidejob_templates
ADD COLUMN IF NOT EXISTS form_schema JSONB DEFAULT '[]';

-- 신청 기능 활성화 여부 컬럼 추가
ALTER TABLE public.admin_sidejob_templates
ADD COLUMN IF NOT EXISTS application_enabled BOOLEAN DEFAULT false;

-- 신청 관련 설정 컬럼 추가
ALTER TABLE public.admin_sidejob_templates
ADD COLUMN IF NOT EXISTS application_settings JSONB DEFAULT '{}';

-- 코멘트
COMMENT ON COLUMN public.admin_sidejob_templates.form_schema IS '동적 폼 스키마 - [{name, label, type, required, placeholder, options, validation}]';
COMMENT ON COLUMN public.admin_sidejob_templates.application_enabled IS '상품 신청 기능 활성화 여부';
COMMENT ON COLUMN public.admin_sidejob_templates.application_settings IS '신청 관련 설정 - {reward_type, reward_amount, auto_assign, notification_emails}';

/*
form_schema 구조 예시:
[
  {
    "name": "business_type",
    "label": "사업자 유형",
    "type": "select",
    "required": true,
    "placeholder": "사업자 유형을 선택하세요",
    "options": [
      {"value": "individual", "label": "개인사업자"},
      {"value": "corporate", "label": "법인사업자"},
      {"value": "none", "label": "사업자 없음"}
    ]
  },
  {
    "name": "business_number",
    "label": "사업자등록번호",
    "type": "text",
    "required": false,
    "placeholder": "000-00-00000",
    "validation": {
      "pattern": "^\\d{3}-\\d{2}-\\d{5}$",
      "message": "올바른 사업자등록번호 형식이 아닙니다"
    }
  },
  {
    "name": "additional_info",
    "label": "추가 요청사항",
    "type": "textarea",
    "required": false,
    "placeholder": "추가로 요청하실 내용이 있으면 입력해주세요"
  },
  {
    "name": "subscribe_newsletter",
    "label": "뉴스레터 수신 동의",
    "type": "checkbox",
    "required": false
  }
]

application_settings 구조 예시:
{
  "reward_type": "commission",  // commission | points | none
  "reward_amount": 5000,
  "auto_assign": null,          // 자동 배정할 담당자 ID (null이면 수동 배정)
  "notification_emails": ["admin@example.com"],
  "duplicate_check": true,      // 중복 신청 체크 여부
  "duplicate_period_days": 30   // 중복 체크 기간 (일)
}
*/
