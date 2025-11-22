---
title: "Supabase MCP 설정 가이드"
category: "infrastructure"
subcategory: "supabase"
tier: 4
status: "active"
last_updated: "2025-10-16"
related_docs:
  - path: "CLAUDE.md"
    description: "Claude Code 개발 가이드"
tags:
  - supabase
  - mcp
  - database
  - postgresql
  - claude-code
---

# Supabase MCP 설정 가이드

## 개요
이 문서는 Claude Code에서 Supabase MCP (Model Context Protocol) 서버를 설정하는 방법을 설명합니다. MCP를 통해 Claude는 Supabase 데이터베이스에 직접 접근하여 스키마 확인, 쿼리 실행, 데이터 조회 등을 수행할 수 있습니다.

## 프로젝트 정보

### Supabase 프로젝트 설정
- **프로젝트 이름**: g-plat
- **프로젝트 Ref ID**: `anwwjowwrxdygqyhhckr`
- **프로젝트 URL**: `https://anwwjowwrxdygqyhhckr.supabase.co`
- **데이터베이스 호스트**: `aws-0-ap-northeast-2.pooler.supabase.com`
- **데이터베이스**: PostgreSQL (Supabase 관리)

### 환경 변수
```bash
# Supabase 프로젝트 URL
VITE_SUPABASE_URL=https://anwwjowwrxdygqyhhckr.supabase.co

# Supabase Anon Key (공개 API 키)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Access Token (관리자 권한 - 민감)
# Supabase Dashboard > Settings > API > Project API keys > service_role key
# 또는 Personal Access Token을 사용하세요
SUPABASE_ACCESS_TOKEN=<YOUR_ACCESS_TOKEN_HERE>
```

## MCP 설정 파일

### Claude Desktop 설정 위치
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### MCP 설정 내용

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres.anwwjowwrxdygqyhhckr:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres"
      ]
    }
  }
}
```

**주의사항:**
- `[PASSWORD]` 부분은 실제 Supabase 데이터베이스 비밀번호로 교체해야 합니다
- 비밀번호는 Supabase Dashboard > Settings > Database에서 확인 가능
- 이 설정 파일은 민감한 정보를 포함하므로 Git에 커밋하지 마세요

### 연결 문자열 형식
```
postgresql://[user].[project-ref]:[password]@[host]:[port]/[database]
```

- **user**: `postgres`
- **project-ref**: `anwwjowwrxdygqyhhckr`
- **password**: Supabase 프로젝트 데이터베이스 비밀번호
- **host**: `aws-0-ap-northeast-2.pooler.supabase.com`
- **port**: `6543` (Connection Pooler), `5432` (Direct Connection)
- **database**: `postgres`

## MCP 사용 예시

Claude Code에서 MCP가 활성화되면 다음과 같은 작업을 수행할 수 있습니다:

### 1. 테이블 스키마 확인
```sql
-- card_attachments 테이블 구조 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'card_attachments'
ORDER BY ordinal_position;
```

### 2. RLS 정책 확인
```sql
-- 테이블의 RLS 정책 조회
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'card_attachments';
```

### 3. 인덱스 확인
```sql
-- 테이블의 인덱스 조회
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'card_attachments';
```

### 4. 데이터 조회
```sql
-- 최근 생성된 첨부파일 조회
SELECT id, title, attachment_type, created_at
FROM card_attachments
ORDER BY created_at DESC
LIMIT 10;
```

### 5. Storage 버킷 확인
```sql
-- Storage 버킷 목록 조회
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets;
```

## 문제 해결

### MCP 연결 실패 시
1. **연결 문자열 확인**: 비밀번호가 올바른지 확인
2. **네트워크 확인**: Supabase 프로젝트가 활성 상태인지 확인
3. **방화벽 설정**: 로컬 방화벽이 PostgreSQL 포트(6543)를 차단하지 않는지 확인
4. **MCP 서버 재시작**: Claude Desktop 애플리케이션 재시작

### Connection Pooler vs Direct Connection
- **Connection Pooler (Port 6543)**: 권장 - 연결 풀링으로 성능 향상
- **Direct Connection (Port 5432)**: 직접 연결 - 트랜잭션 모드 필요 시

### 권한 문제
- MCP는 `postgres` 사용자 권한으로 접근합니다
- RLS 정책이 적용되지 않으므로 모든 데이터에 접근 가능
- 프로덕션 데이터를 다룰 때는 주의가 필요합니다

## 보안 고려사항

1. **비밀번호 관리**
   - MCP 설정 파일은 로컬에만 저장
   - Git에 커밋하지 않음 (.gitignore 확인)
   - 주기적으로 데이터베이스 비밀번호 변경

2. **접근 제한**
   - MCP는 개발 환경에서만 사용
   - 프로덕션 데이터 수정 시 백업 필수
   - 읽기 전용 작업 권장

3. **로깅**
   - MCP 쿼리는 Supabase Dashboard에서 모니터링 가능
   - 민감한 데이터 조회 시 로그 확인

## 관련 문서

- [Supabase CLI 가이드](https://supabase.com/docs/guides/cli)
- [PostgreSQL MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres)
- [Claude MCP Documentation](https://www.anthropic.com/model-context-protocol)

## 업데이트 이력

- **2025.10.16**: 초기 문서 작성
  - Supabase MCP 설정 방법 정리
  - 프로젝트 정보 및 연결 문자열 문서화
  - 사용 예시 및 문제 해결 가이드 추가
