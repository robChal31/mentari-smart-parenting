# AI Agent Instructions — MentariParent Project

## Project Context
You are working on Mentari Smart Parent, a parenting knowledge hub web platform by
Mentari Group (an education company). The platform serves parenting content
(videos, articles, tips) and contextually recommends Mentari Group's education
products (books, digital learning, assessments).

## Tech Stack
- **Monorepo**: Turborepo with pnpm
- **Frontend**: Next.js 14+ (App Router, RSC, TypeScript)
- **Backend**: NestJS (TypeScript, modular architecture)
- **Database**: MySQL via Prisma ORM
- **Auth**: Supabase Auth (JWT-based)
- **Storage**: Supabase Storage (images, thumbnails)
- **Styling**: Tailwind CSS
- **State**: Zustand (client-side)
- **Forms**: React Hook Form + Zod
- **Package Manager**: pnpm

## Architecture Rules
1. Monorepo with `apps/web` (Next.js) and `apps/api` (NestJS)
2. Shared code in `packages/shared` (types, constants, validators)
3. Database schema in `packages/database` (Prisma)
4. Backend follows NestJS module pattern: controller → service → entity
5. Frontend uses Next.js App Router with server components by default
6. Client components only when interactivity is needed (use 'use client')

## Coding Standards
- TypeScript strict mode everywhere
- Use Zod for all validation (shared between FE and BE)
- API responses follow standard format: { success, data, meta?, error? }
- Use snake_case for database columns, camelCase in TypeScript
- Prisma handles the mapping via @map()
- All API endpoints prefixed with /api/v1
- Use UUID for all primary keys
- Error handling: NestJS exception filters, Next.js error boundaries

## File Naming Conventions
- Components: PascalCase (e.g., ContentCard.tsx)
- Pages: lowercase with Next.js App Router conventions
- Services/Controllers: kebab-case with suffix (e.g., contents.service.ts)
- Types: PascalCase with .types.ts suffix
- Utils: camelCase with .util.ts suffix

## UI/UX Guidelines
- Mobile-first responsive design
- Use shadcn/ui components as base, customize with Tailwind
- Color palette: Primary #FF6B35, Secondary #004E89, Accent #2EC4B6
- Fonts: Plus Jakarta Sans (headings), Inter (body)
- All images use Next.js Image component
- Loading states: skeleton screens (not spinners)
- Product recommendations must be visually distinct but non-intrusive
- Label product recommendations as "Rekomendasi dari Mentari"

## Key Business Logic
- Product recommendations are based on:
  1. Manual content-product mapping (highest priority)
  2. Matching age groups between content and products
  3. Matching categories
  4. Featured products (fallback)
- Child age is calculated from birthdate, maps to AgeGroup
- Content can be: VIDEO, ARTICLE, INFOGRAPHIC, TIPS, ACTIVITY
- Products types: BOOK_NATIONAL, BOOK_INTERNATIONAL, BOOK_SELF_PUBLISHED,
  BOOK_STORYBOOK, DIGITAL_LEARNING, ENGLISH_ASSESSMENT, TEACHER_ACADEMY

## When Creating New Features
1. Create/update Prisma schema if needed
2. Create NestJS module (module, controller, service, DTOs, entities)
3. Add Zod validation schemas in packages/shared
4. Create API endpoints following REST conventions
5. Build Next.js pages and components
6. Add proper TypeScript types
7. Include error handling and loading states
8. Ensure mobile responsiveness
9. Add proper SEO meta tags for public pages

## Database Reference
See packages/database/prisma/schema.prisma for the complete schema.
Key models: User, Child, Content, Category, AgeGroup, Product,
ContentProduct, Bookmark, ContentView, ProductClick,
GamificationProfile, Badge, CommunityThread, CommunityComment.

## Important Notes
- Supabase handles authentication; backend validates JWT from Supabase
- Product CTAs link to external URLs (Mentari Group product pages)
- Track all product clicks with source context for analytics
- Content pages must be SSR for SEO
- Admin panel is client-side rendered (behind auth)
```

---
