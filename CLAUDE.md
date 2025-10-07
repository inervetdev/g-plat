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
     - Sidejob cards management system
     - Visitor statistics and analytics dashboard
     - Real-time data synchronization
     - Dashboard with metrics display

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
  - ✅ Sidejob cards linked to specific business cards (many-to-many support)
  - ✅ Business card + Sidejob card integrated preview
  - ✅ Sidejob image upload to Supabase Storage
  - ✅ Storage RLS policies for secure file uploads
  - ✅ Dashboard card preview modal with unified view
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
  - ✅ Database migrations for QR system
  - ✅ Playwright E2E testing setup
  - ✅ Supabase MCP integration
  - ✅ Social login UI (Google, Kakao, Apple) - ready for OAuth configuration
- **Pending Features (Phase 3)**:
  - ⏳ Callback automation system
  - ⏳ SMS automation (Twilio/Aligo integration)
  - ⏳ Payment integration (Premium/Business tiers)
  - ⏳ Korean domain (.한국) system implementation
  - ⏳ Additional premium card templates
  - ⏳ Team collaboration features
  - ⏳ Advanced CRM features
- **Technology Strategy**: Continue with React for rapid MVP development, evaluate Next.js migration based on user feedback and scaling needs

### Next Steps
1. **Phase 3 Development**:
   - Callback automation system
   - SMS integration with Twilio/Aligo
   - Payment system integration (Stripe/Toss Payments)
   - Korean domain (.한국) registration system
2. **Performance Optimization**:
   - Image optimization and lazy loading
   - Code splitting and bundle size reduction
   - Caching strategy implementation
3. **Analytics Enhancement**:
   - Conversion funnel tracking
   - A/B testing framework
   - User behavior heatmaps

## Database Schema
The MySQL database (`gplat`) includes tables for users, business cards, side business cards, analytics, and callback management. Schema initialization is in `sql/init.sql`.

## Security Considerations
- Authentication planned via Supabase Auth
- Current demo credentials in README.md should be replaced
- Database passwords are hardcoded in docker-compose.yml
- No secrets management system in place yet

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