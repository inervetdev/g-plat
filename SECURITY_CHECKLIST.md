# Security Checklist

## ✅ Current Security Status

### Authentication & Authorization
- [x] Supabase Auth configured with email/password
- [x] OAuth providers planned (Google, Kakao, Apple)
- [x] Row Level Security (RLS) enabled on all tables
- [x] JWT token-based authentication
- [x] Session persistence with auto-refresh

### Database Security
- [x] RLS policies on `users` table (users can only view/update own profile)
- [x] RLS policies on `sidejob_cards` table (users can only modify own cards)
- [x] RLS policies on `visitor_stats` table
- [x] RLS policies on `callback_logs` table
- [x] Storage RLS policies on `sidejob-cards` bucket
  - INSERT: authenticated users only
  - SELECT: public read access
  - UPDATE/DELETE: authenticated users only

### Environment Variables
- [x] `.env` files excluded from Git via `.gitignore`
- [x] Sensitive tokens not hardcoded in source code
- [x] Production secrets managed via Vercel environment variables

### Storage Security
- [x] Public bucket for sidejob images (intended for public sharing)
- [x] Authenticated upload only
- [x] File path structure: `sidejob-images/{user_id}/{timestamp}.{ext}`

## ⚠️ Security Recommendations

### High Priority

1. **Rotate Supabase Access Token Regularly**
   - Current token: `sbp_27e4a62c9712236fe7b5c4deeb9ebbbfd876d5fb`
   - Recommendation: Rotate every 90 days
   - Store in secure location (not in code/chat history)

2. **Add File Upload Validation**
   ```typescript
   // Recommended validations:
   - File type whitelist (image/jpeg, image/png, image/webp)
   - Maximum file size (e.g., 5MB)
   - Virus scanning for production
   - Image dimension limits
   ```

3. **Implement Rate Limiting**
   - Storage uploads: 10 files per minute per user
   - API endpoints: 100 requests per minute per IP
   - Use Supabase Edge Functions with rate limiting

4. **Add Content Security Policy (CSP)**
   ```html
   <meta http-equiv="Content-Security-Policy"
         content="default-src 'self'; img-src 'self' https://*.supabase.co data:; script-src 'self' 'unsafe-inline'">
   ```

### Medium Priority

5. **Storage Policies Enhancement**
   - Add user-specific upload folders (currently anyone can upload)
   - Implement file quota per user tier (FREE: 50MB, PREMIUM: 500MB, BUSINESS: 5GB)
   - Add automatic image optimization

6. **Add Audit Logging**
   - Log all sensitive operations (login, card creation, deletion)
   - Store in separate `audit_logs` table
   - Implement log retention policy

7. **Input Sanitization**
   - Sanitize all user inputs to prevent XSS
   - Use DOMPurify for rich text inputs
   - Validate URLs before storing

### Low Priority

8. **Add HTTPS Enforcement**
   - Already enforced by Vercel in production
   - Ensure all external API calls use HTTPS

9. **Implement CORS Properly**
   - Currently open for development
   - Restrict to production domain in Supabase settings

10. **Add Security Headers**
    ```
    X-Frame-Options: DENY
    X-Content-Type-Options: nosniff
    Referrer-Policy: strict-origin-when-cross-origin
    ```

## 🔒 Sensitive Data Management

### DO NOT expose in code or Git:
- ❌ `SUPABASE_ACCESS_TOKEN` (CLI access)
- ❌ Service Role Key (if using)
- ❌ SMS API keys (Twilio/Aligo)
- ❌ Payment gateway secrets
- ❌ Domain API keys

### SAFE to expose (already public):
- ✅ `VITE_SUPABASE_URL` (public endpoint)
- ✅ `VITE_SUPABASE_ANON_KEY` (protected by RLS)
- ✅ App URLs and public configuration

## 📝 Security Incident Response

If security breach occurs:
1. Immediately rotate all access tokens in Supabase Dashboard
2. Review audit logs for suspicious activity
3. Reset affected user passwords
4. Update RLS policies if needed
5. Document incident and preventive measures

## 🔄 Regular Security Tasks

### Weekly
- Review Supabase logs for anomalies
- Check failed authentication attempts

### Monthly
- Review and update RLS policies
- Audit user permissions
- Check for outdated dependencies: `npm audit`

### Quarterly
- Rotate access tokens
- Security penetration testing
- Review and update this checklist

---

**Last Updated:** 2025-10-07
**Next Review:** 2026-01-07
