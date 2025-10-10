# Supabase Storage Bucket 생성 가이드

## 문제
`sidejob-cards` 스토리지 버킷이 없어서 이미지 업로드 시 "Bucket not found" 에러가 발생합니다.

## 해결 방법

### 옵션 1: Supabase Dashboard 사용 (권장)

1. Supabase Dashboard 접속: https://supabase.com/dashboard/project/anwwjowwrxdygqyhhckr
2. Storage 메뉴로 이동
3. "New bucket" 버튼 클릭
4. 버킷 설정:
   - **Name**: `sidejob-cards`
   - **Public bucket**: ✅ 체크 (공개 읽기 허용)
   - **File size limit**: 5 MB (5242880 bytes)
   - **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
5. "Create bucket" 클릭

### 옵션 2: SQL Editor 사용

Supabase Dashboard > SQL Editor에서 다음 SQL 실행:

```sql
-- 1. Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sidejob-cards',
  'sidejob-cards',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;
```

### 옵션 3: RLS 정책 설정

버킷 생성 후, 다음 RLS 정책을 적용:

```sql
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Authenticated users can upload sidejob images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'sidejob-cards' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own images
CREATE POLICY "Authenticated users can update their own sidejob images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'sidejob-cards' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'sidejob-cards' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own images
CREATE POLICY "Authenticated users can delete their own sidejob images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'sidejob-cards' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access
CREATE POLICY "Public read access for sidejob images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'sidejob-cards');
```

## 검증

버킷 생성 후 다음을 확인:

1. Supabase Dashboard > Storage에서 `sidejob-cards` 버킷이 보이는지 확인
2. 버킷 클릭 후 Settings에서 Public access가 활성화되어 있는지 확인
3. Policies 탭에서 4개의 정책이 모두 생성되었는지 확인:
   - INSERT policy (authenticated users)
   - UPDATE policy (authenticated users)
   - DELETE policy (authenticated users)
   - SELECT policy (public)

## 테스트

앱에서 부가명함 생성 시 이미지 업로드가 정상 작동하는지 확인:

1. http://localhost:5176 접속 (또는 프로덕션 URL)
2. 대시보드 > 부가명함 관리
3. "새 부가명함 추가" 클릭
4. 카테고리 선택 및 정보 입력
5. 이미지 파일 선택 (5MB 이하, JPG/PNG/WEBP/GIF)
6. 업로드 성공 확인 (미리보기 이미지가 표시됨)
7. 폼 제출
8. Supabase Storage에서 업로드된 이미지 파일 확인

## 파일 구조

업로드된 이미지는 다음 경로에 저장됩니다:
```
sidejob-cards/
└── sidejob-images/
    └── {user_id}/
        └── {timestamp}.{ext}
```

예시: `sidejob-cards/sidejob-images/a1b2c3d4-e5f6-7890-abcd-ef1234567890/1728567890123.jpg`
