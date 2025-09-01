# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production (includes Prisma generate and migrate)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks
- `npm run db:seed` - Seed the database with initial data
- `npm run db:reset` - Reset database and re-seed

## Architecture Overview

This is a Next.js 15 e-commerce platform with the following key architectural components:

### Frontend Architecture
- **Next.js App Router** - Uses the app directory structure with React Server Components
- **shadcn/ui Components** - Located in `components/ui/` with configuration in `components.json`
- **Tailwind CSS** - Custom styling with CSS variables for theming
- **TypeScript** - Strict typing with path aliases (`@/*` maps to root)

### Backend & Database
- **Prisma ORM** - PostgreSQL database with complex e-commerce schema
- **NextAuth.js** - Authentication system
- **API Routes** - Located in `app/api/` directory
- **Server Actions** - Enabled via Next.js experimental config

### Key Data Models
- **Products** - Complex variant system with VariantTypes, VariantOptions, and ProductVariants
- **Orders** - Full order lifecycle with guest and authenticated user support
- **Users** - Role-based system (CLIENT/ADMIN) with shipping addresses
- **Categories & Brands** - Product organization with tags

### Component Organization
```
components/
├── admin/           # Admin dashboard components
├── cart/            # Shopping cart functionality  
├── category/        # Category-related components
├── common/          # Shared/reusable components
├── layout/          # Layout components (header, footer, etc.)
├── product/         # Product display and interaction
├── products/        # Product listing components
└── ui/              # shadcn/ui base components
```

### UI/UX Design Guidelines

**Design System:**
- **shadcn/ui** with "new-york" style variant
- **Tailwind CSS v4** with OKLCH color space
- **Icons**: Use @tabler/icons-react ONLY (replace any Lucide icons when encountered)
- **Typography**: Montserrat (light mode), Inter (dark mode), Geist fonts
- **Currency**: Display prices in MAD (Moroccan Dirham)
- **Border radius**: 0.35rem for consistent rounded corners

**Component Patterns:**
- All UI components use `data-slot` attributes for styling hooks
- Use `class-variance-authority` for component variants
- Follow mobile-first responsive design with touch device detection
- Implement progressive disclosure (actions reveal on hover/touch)
- Cards use rounded-xl borders with shadow-sm and 6px internal gaps

**Color & Theming:**
- Full light/dark mode support with CSS variables
- Use semantic color tokens (primary, secondary, muted, destructive, etc.)
- OKLCH color space for precise color management
- Consistent focus rings and accessibility patterns

### Important Configuration
- TypeScript configured with strict mode and Next.js plugin
- ESLint and TypeScript errors ignored during builds (for development speed)
- Image domains configured for external image sources
- CORS and security headers configured for production
- Turbopack enabled for faster development builds

### Database Development
- Use `npm run db:reset` to reset and re-seed database during development
- Prisma schema located in `prisma/schema.prisma`
- Database seeding script in `prisma/seed.ts`

### Testing & Quality
- Run `npm run lint` before committing changes
- TypeScript checking can be done via IDE or `tsc --noEmit`