# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

지플랫(G-Plat) 모바일 명함 서비스 - A mobile business card platform that combines LinkedIn-style professional networking with side business portfolio management. The platform features Korean domain-based personal branding (e.g., 김대리.한국) and automated callback systems for customer engagement.

## Development Commands

### React App Development (Primary)
```bash
# Navigate to React app directory
cd react-app

# Install dependencies
npm install

# Start development server
npm run dev
# App runs on http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

### Node.js Development (Legacy)
```bash
# Install dependencies
npm install

# Start local server (Express)
npm start
# or development mode with auto-reload
npm run dev

# Server runs on http://localhost:8080
```

### Docker Development
```bash
# Start all services (Tomcat, MySQL, Redis, phpMyAdmin)
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f web

# Access services
# - Web: http://localhost:8080
# - phpMyAdmin: http://localhost:8081
# - MySQL: localhost:3306
```

### Database Access
```bash
# Connect to MySQL container
docker exec -it gplat-db mysql -u root -pgplat2024!

# Database credentials:
# Root: root / gplat2024!
# User: gplat_user / gplat_pass
```

### Supabase Local Development
```bash
# Navigate to React app directory
cd react-app

# Start Supabase local services
npx supabase start
# Services:
# - API: http://127.0.0.1:54321
# - Studio: http://127.0.0.1:54323
# - Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres

# Stop Supabase services
npx supabase stop

# Reset database (reapply migrations)
npx supabase db reset

# Serve Edge Functions locally
npx supabase functions serve qr-redirect --no-verify-jwt
# Function URL: http://127.0.0.1:54321/functions/v1/qr-redirect

# Deploy Edge Functions to production
npx supabase functions deploy qr-redirect
```

### Testing
```bash
# Navigate to React app directory
cd react-app

# Run Playwright E2E tests
npx playwright test

# Run specific test file
npx playwright test tests/gplat-production.spec.ts

# View test report
npx playwright show-report
```

### Public Access Setup
```bash
# Windows batch scripts available:
run-local.bat          # Start local server
start-public-access.bat # Setup ngrok tunnel
setup-firewall.bat     # Configure firewall
setup-ngrok.ps1        # PowerShell ngrok setup
```

## Architecture

### Technology Decision
**Current Stack**: React 18 + TypeScript + Vite + Supabase
- Fast development with Vite's HMR and build optimization
- Flexible architecture without Next.js constraints
- Direct Supabase integration for real-time features
- Future migration to Next.js 14 possible after MVP validation

### Current State
The project has three parallel implementations:

1. **React App (Primary Development)** (`react-app/`)
   - React 18 + TypeScript + Vite development environment
   - Supabase integration for auth and database
   - Main active development path
   - Features implemented:
     - User authentication with Supabase Auth
     - Business card CRUD operations
     - Custom URL validation and duplicate checking
     - Sidejob cards management system with categories (2025.10.10 ✅)
       * 5 Primary categories, 16 Secondary categories
       * Category-based CTA auto-suggestion
       * Badge, expiry date, pricing display
     - Supabase Storage integration (2025.10.10 ✅)
       * Image upload (max 5MB, JPG/PNG/WEBP/GIF)
       * 4 RLS policies for security
     - Visitor statistics and analytics dashboard
     - Real-time data synchronization
     - Dashboard with metrics display
     - CardViewPage integration with sidejob cards (2025.10.10 ✅)

2. **Node.js/Express Server** (`standalone-server.js`) - Legacy
   - Simple Express server serving static HTML
   - Simulates JSP functionality by replacing template variables
   - To be deprecated

3. **JSP/Tomcat Application** (webapps/ROOT/) - Legacy
   - Traditional JSP architecture
   - Designed for Docker deployment
   - Multiple card templates (simple, professional, trendy, apple themes)
   - Admin dashboards for each theme
   - To be deprecated

### Directory Structure
- `react-app/` - React application (Primary)
  - `src/pages/` - Page components (Dashboard, CreateCard, EditCard, SideJobCards, Stats, etc.)
  - `src/components/` - Reusable UI components
  - `src/lib/` - Utilities and Supabase client
  - `src/types/` - TypeScript type definitions
  - `supabase/` - Supabase configuration and migrations
    - `config.toml` - Supabase local development configuration
    - `migrations/` - Database migration files
    - `functions/` - Edge Functions (Deno)
      - `qr-redirect/` - QR code redirect and scan tracking function
  - `tests/` - Playwright E2E tests
  - `playwright.config.ts` - Playwright configuration
- `webapps/ROOT/` - JSP web application (Legacy)
  - `card/` - Mobile business card pages (multiple themes)
  - `admin/` - Dashboard pages (matching themes)
  - `WEB-INF/` - Java web configuration
- `supabase/functions/` - Root Edge Functions directory
- `sql/init.sql` - Database initialization script (Legacy)
- `assets/` - Static resources
- Static HTML prototypes in root (gplat_*.html files)

### Key Technologies
- **Frontend (Current)**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend (Current)**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **State Management**: Zustand for global state
- **UI Library**: shadcn/ui components
- **Charts**: Recharts for analytics
- **QR Code**: qrcode.js for generation
- **Edge Functions**: Deno runtime on Supabase
- **Testing**: Playwright for E2E tests
- **CLI Tools**: Supabase CLI, Playwright CLI
- **Frontend (Legacy)**: JSP pages with embedded JavaScript
- **Backend (Legacy)**: Node.js/Express for dev, Tomcat for production
- **Database (Legacy)**: MySQL 8.0 with Redis cache

## Important Context

### Business Model
- **Freemium SaaS**: Basic free tier, Premium (₩9,900/month), Business (₩29,900/month)
- **Side Business Integration**: Users can add multiple "business cards" for different side businesses
- **Automated Callbacks**: After phone calls, automatically sends SMS with business card link
- **Korean Domains**: Each user gets personalized .한국 domain

### Development Priorities (from PRD)
1. MVP completion with core features
2. User onboarding optimization (3-minute setup)
3. Korean domain system implementation
4. Callback automation system
5. Real-time analytics dashboard

### Development Roadmap
**Phase 1 (Completed)**: MVP Foundation
- ✅ React 18 + Vite project setup
- ✅ Supabase integration (Auth, Database, Storage)
- ✅ TypeScript configuration
- ✅ Tailwind CSS + shadcn/ui components
- ✅ User authentication system
- ✅ Business card CRUD operations
- ✅ Custom URL validation
- ✅ Mobile-responsive UI

**Phase 2 (Completed)**: Core Features
- ✅ Sidejob cards management
- ✅ Real-time analytics dashboard
- ✅ QR code generation with tracking
- ✅ QR code Edge Function with scan tracking
- ✅ Supabase local development environment setup

**Phase 3 (Planned)**: Advanced Features
- Payment integration
- SMS automation (Twilio/Aligo)
- Advanced templates
- Team collaboration features

## Supabase MCP Integration

Claude Code has direct access to the production Supabase database via MCP (Model Context Protocol).

### MCP Configuration
- **Project**: g-plat (`anwwjowwrxdygqyhhckr`)
- **Database**: PostgreSQL on Supabase (AWS ap-northeast-2)
- **Connection**: `postgresql://postgres.anwwjowwrxdygqyhhckr:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres`
- **Documentation**: [docs/SUPABASE_MCP.md](docs/SUPABASE_MCP.md)

### Available MCP Operations
- Schema inspection (`information_schema.columns`)
- RLS policy queries (`pg_policies`)
- Index verification (`pg_indexes`)
- Data querying and analysis
- Storage bucket information (`storage.buckets`)

**Important**: MCP bypasses RLS policies - exercise caution when modifying production data.

### Current Development Status
- **Active Development**: React app with Supabase integration - **✅ PRODUCTION DEPLOYED**
- **Deployment Status**:
  - ✅ Production deployment on Vercel with custom domain
  - ✅ GitHub repository: https://github.com/inervetdev/g-plat
  - ✅ Environment variables configured (Supabase, App settings)
  - ✅ All critical features tested (registration, login, card creation)
  - ✅ TypeScript build errors resolved
  - ✅ Mobile-responsive UI verified
  - ✅ QR Edge Function deployed to production (ACTIVE status)
  - ✅ Production database schema applied (qr_codes, qr_scans tables)
- **Completed Features (Phase 1 & 2)**:
  - ✅ User authentication (Supabase Auth)
  - ✅ Business card CRUD with custom URL
  - ✅ Custom URL validation and duplicate checking
  - ✅ Sidejob cards management (CRUD, ordering, drag-and-drop)
  - ✅ **Sidejob cards category system (2025.10.10)**
    - 5 Primary categories: 쇼핑/판매, 교육/콘텐츠, 서비스/예약, 구독/멤버십, 프로모션/혜택
    - 16 Secondary categories with smart categorization
    - Category-based CTA text auto-suggestion
    - Category badges with color coding
    - Badge, expiry date, pricing display
  - ✅ Sidejob cards linked to specific business cards (many-to-many support)
  - ✅ Business card + Sidejob card integrated preview
  - ✅ **Supabase Storage integration (2025.10.10)**
    - sidejob-cards storage bucket (local)
    - Image upload (max 5MB, JPG/PNG/WEBP/GIF)
    - 4 RLS policies (INSERT, UPDATE, DELETE, SELECT)
    - User-specific folder structure: sidejob-images/{user_id}/
  - ✅ Storage RLS policies for secure file uploads
  - ✅ Dashboard card preview modal with unified view
  - ✅ **CardViewPage integration improvements (2025.10.10)**
    - Refactored to use CardWithSideJobs component
    - Sidejob cards auto-display on actual card pages (/card/:id)
    - Image click → CTA link navigation
    - Active sidejob filtering in preview modals
  - ✅ Visitor statistics dashboard (Recharts)
  - ✅ Real-time data synchronization
  - ✅ RLS policies for security
  - ✅ Dashboard with dynamic metrics
  - ✅ QR code generation with tracking (full implementation)
  - ✅ QR code redirect Edge Function with scan tracking (PRODUCTION DEPLOYED)
  - ✅ Device/Browser/OS detection for scans
  - ✅ Scan analytics (referrer, IP, user-agent tracking)
  - ✅ Production QR system database schema (8 RLS policies, 7 indexes, analytics view)
  - ✅ Multiple card themes (Trendy, Apple, Professional, Simple, Default)
  - ✅ Theme preview modal with live preview
  - ✅ Analytics dashboard with charts and visitor tracking
  - ✅ Profile image and company logo upload
  - ✅ Supabase local development environment
  - ✅ Database migrations for QR system and sidejob categories
  - ✅ Playwright E2E testing setup
  - ✅ Supabase MCP integration
  - ✅ Social login UI (Google, Kakao, Apple) - ready for OAuth configuration
  - ✅ **Attachment system with YouTube Shorts support (2025.10.16)**
    - YouTube Shorts URL parsing (youtube.com/shorts/VIDEO_ID)
    - 5 theme cards with enhanced getYouTubeVideoId function
    - Support for embed URLs, no-cookie domains, and fallback regex
  - ✅ **Drag-and-drop attachment reordering (2025.10.16)**
    - @dnd-kit library integration
    - Visual drag handle with hover effects
    - Keyboard accessibility (arrow keys + space/enter)
    - Automatic display_order persistence to database
- **Pending Features (Phase 3)**:
  - ⏳ Callback automation system
  - ⏳ SMS automation (Twilio/Aligo integration)
  - ⏳ Payment integration (Premium/Business tiers)
  - ⏳ Korean domain (.한국) system implementation
  - ⏳ Additional premium card templates
  - ⏳ Team collaboration features
  - ⏳ Advanced CRM features
- **Technology Strategy**: Continue with React for rapid MVP development, evaluate Next.js migration based on user feedback and scaling needs

### Next Steps (Phase 3)
1. **Callback Automation System**:
   - Call end detection and automatic SMS sending
   - Twilio/Aligo API integration
   - Message template management
   - Send history tracking

2. **Payment System Integration**:
   - Stripe/Toss Payments integration
   - Subscription plan management (Free/Premium/Business)
   - Payment history and receipt management

3. **Korean Domain (.한국) System**:
   - Gabia domain API integration
   - Automatic domain creation and verification
   - DNS configuration automation

4. **Performance & Analytics**:
   - Image optimization and lazy loading
   - Code splitting and bundle size reduction
   - Conversion funnel tracking
   - A/B testing framework

## Database Schema
The production database uses **Supabase PostgreSQL** with the following key tables:
- `business_cards` - Main business card data with custom URLs
- `sidejob_cards` - Side business portfolio cards with categories
- `card_attachments` - File and YouTube attachments for cards
- `qr_codes` - QR code generation and tracking
- `qr_scans` - QR scan analytics with device/browser detection
- `visitor_stats` - Page visit tracking and analytics
- **Storage Buckets**: `card-attachments`, `sidejob-cards`

All tables have Row Level Security (RLS) policies applied for security.

## Security
- ✅ **Authentication**: Supabase Auth with email/password and social login UI
- ✅ **Database Security**: RLS policies on all tables
- ✅ **Storage Security**: RLS policies with user-specific folder access
- ✅ **API Security**: Supabase anon key with RLS enforcement
- ⏳ **Environment Variables**: Managed via Vercel and local .env files
- ⏳ **Secrets Management**: To be implemented for SMS/payment API keys

## Technical Stack (Current)
### Frontend
- **Framework**: React 18.x with Vite
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Routing**: React Router v6
- **Charts**: Recharts
- **QR Code**: qrcode.js

### Backend (Supabase)
- **Database**: PostgreSQL (Supabase DB)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Realtime**: Supabase Realtime subscriptions
- **Functions**: Edge Functions (Deno runtime)
- **RLS**: Row Level Security policies

### Infrastructure
- **Hosting**: Vercel (Production deployed with custom domain)
- **CDN**: Cloudflare (planned)
- **Version Control**: GitHub (https://github.com/inervetdev/g-plat)
- **SMS**: Twilio/Aligo for callback system (planned)
- **Monitoring**: Sentry, Google Analytics (to be configured)
- **Domain**: Custom domain connected, .한국 domains (planned)