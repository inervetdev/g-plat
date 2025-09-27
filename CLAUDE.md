# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

지플랫(G-Plat) 모바일 명함 서비스 - A mobile business card platform that combines LinkedIn-style professional networking with side business portfolio management. The platform features Korean domain-based personal branding (e.g., 김대리.한국) and automated callback systems for customer engagement.

## Development Commands

### Node.js Development
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

### Public Access Setup
```bash
# Windows batch scripts available:
run-local.bat          # Start local server
start-public-access.bat # Setup ngrok tunnel
setup-firewall.bat     # Configure firewall
setup-ngrok.ps1        # PowerShell ngrok setup
```

## Architecture

### Migration Decision
**Chosen Stack**: Next.js 14 + TypeScript + Supabase
- Evaluated alternatives: Ruby on Rails, Remix, SvelteKit
- Selected for optimal Supabase integration and PRD alignment
- Migration timeline: 4-6 weeks for complete transition

### Current State
The project has two parallel implementations:

1. **Node.js/Express Server** (`standalone-server.js`)
   - Simple Express server serving static HTML
   - Simulates JSP functionality by replacing template variables
   - Main entry point for local development

2. **JSP/Tomcat Application** (webapps/ROOT/)
   - Traditional JSP architecture
   - Designed for Docker deployment
   - Multiple card templates (simple, professional, trendy, apple themes)
   - Admin dashboards for each theme

### Directory Structure
- `webapps/ROOT/` - JSP web application
  - `card/` - Mobile business card pages (multiple themes)
  - `admin/` - Dashboard pages (matching themes)
  - `WEB-INF/` - Java web configuration
- `sql/init.sql` - Database initialization script
- `assets/` - Static resources
- Static HTML prototypes in root (gplat_*.html files)

### Key Technologies
- **Frontend**: JSP pages with embedded JavaScript, planning migration to Next.js
- **Backend**: Currently Node.js/Express for dev, Tomcat for production
- **Database**: MySQL 8.0 with Redis cache
- **Planned Stack**: Next.js 14 + TypeScript + Supabase (per PRD)

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

### Migration Roadmap
**Phase 1 (Week 1)**: Project Setup
- Next.js 14 project initialization
- Supabase integration (Auth, Database, Storage)
- TypeScript configuration
- Tailwind CSS + Shadcn/ui setup

**Phase 2 (Weeks 2-3)**: Core Features
- User authentication system
- Business card CRUD operations
- Korean domain system implementation
- Mobile-responsive UI

**Phase 3 (Weeks 4-5)**: Advanced Features
- Side business card management
- Callback automation system
- Real-time analytics dashboard
- Edge functions for SMS integration

### Current Issues and Decisions
- npm dependencies not installed (express, nodemon missing)
- No Git repository initialized
- Dual architecture (JSP + Node.js) needs consolidation
- **Decision Made**: Migrate to Next.js 14 + TypeScript + Supabase (aligns with PRD)
- **Rationale**:
  - Perfect match with PRD specifications
  - Superior Supabase integration
  - Modern React ecosystem
  - Built-in optimizations

## Database Schema
The MySQL database (`gplat`) includes tables for users, business cards, side business cards, analytics, and callback management. Schema initialization is in `sql/init.sql`.

## Security Considerations
- Authentication planned via Supabase Auth
- Current demo credentials in README.md should be replaced
- Database passwords are hardcoded in docker-compose.yml
- No secrets management system in place yet

## Technical Stack (Confirmed)
### Frontend
- **Framework**: Next.js 14.x with App Router
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **UI Components**: Shadcn/ui
- **State Management**: Zustand

### Backend (Supabase)
- **Database**: PostgreSQL (Supabase DB)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Realtime**: Supabase Realtime subscriptions
- **Functions**: Edge Functions (Deno runtime)

### Infrastructure
- **Hosting**: Vercel (optimal for Next.js)
- **CDN**: Cloudflare
- **SMS**: Twilio/Aligo for callback system
- **Monitoring**: Sentry, Vercel Analytics