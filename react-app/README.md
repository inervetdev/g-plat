# G-Plat React App

지플랫(G-Plat) 모바일 명함 서비스 - React 18 + TypeScript + Vite + Supabase

## Project Status - ✅ Phase 1 & 2 Complete

### Completed Features (프로덕션 배포 완료)
- ✅ React 18 + TypeScript + Vite development environment
- ✅ Supabase integration (Auth, Database, Realtime, Storage, Edge Functions)
- ✅ User authentication system
- ✅ Business card CRUD with custom URL
- ✅ Sidejob cards management (drag-and-drop ordering)
- ✅ Visitor statistics dashboard (Recharts)
- ✅ QR code generation and tracking system
- ✅ **QR code redirect Edge Function (PRODUCTION DEPLOYED)**
  - Edge Function URL: `https://anwwjowwrxdygqyhhckr.supabase.co/functions/v1/qr-redirect/{short_code}`
  - Status: ACTIVE, Version 1
  - Device/Browser/OS detection
  - Scan analytics tracking
- ✅ **Production database schema deployed**
  - qr_codes, qr_scans tables (with browser, os columns)
  - 8 RLS security policies
  - 7 performance indexes
  - qr_code_analytics view
  - auto-update triggers
- ✅ Multiple card themes (Trendy, Apple, Professional, Simple, Default)
- ✅ Supabase local development environment
- ✅ Playwright E2E testing setup

## Tech Stack

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
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Realtime**: Supabase Realtime subscriptions
- **Functions**: Edge Functions (Deno runtime)

## React + Vite Template

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
