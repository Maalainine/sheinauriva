# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack on port 3000
- `./scripts/dev-clean.sh` - Clean start development server (kills any existing servers first)
- `npm run build` - Build for production (includes Prisma generate and migrate)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks
- `npm run db:seed` - Seed the database with initial data
- `npm run db:reset` - Reset database and re-seed

### Development Server Setup
The development server is configured to **always run on port 3000** to avoid port conflicts. If you encounter issues with multiple servers or port conflicts:

1. Use `./scripts/dev-clean.sh` to clean start the server
2. Or manually kill processes: `pkill -f "next.*dev"` then `npm run dev`

**Important**: Always ensure only one development server is running to avoid API endpoint conflicts.

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

## Pending Modifications (To Do)

### Phase 1: Icon Library Migration
- **Replace all Lucide icons with Tabler equivalents** across all components (20+ files affected)
- **Update `components.json`** to reflect Tabler as the icon library instead of "lucide"
- **Remove lucide-react dependency** (if no longer needed after migration)
- **Verify all icon imports** use @tabler/icons-react consistently

### Phase 2: Configuration Cleanup
- **Consolidate Next.js configuration** - remove duplicate config files (next.config.js vs next.config.ts)
- **Verify shadcn/ui configuration** matches design system requirements
- **Ensure consistent 0.35rem border radius** throughout all components
- **Review and standardize component configurations**

### Phase 3: Typography & Styling
- **Verify font assignments** in CSS variables (Montserrat light mode, Inter dark mode)
- **Ensure OKLCH color space** usage is consistent across all color tokens
- **Check component `data-slot` attributes** implementation
- **Validate CSS variable naming** matches design system specifications

### Current Issues (In Progress)
*No current issues - all major UX/UI enhancements have been completed*

### Recently Completed ✅
- **Complete Client Account System** - Full user authentication and account management
  - Client login/registration with separate auth provider from admin
  - Account dashboard with order stats, spending history, and quick actions
  - Order history with detailed order views and status tracking
  - Wishlist management with add/remove functionality and cart integration
  - Profile management with personal info updates and password changes  
  - Address management with CRUD operations and default address setting
  - Secure API endpoints with proper session validation and error handling
  - **Layout optimization** - Account pages moved outside public layout (no header/footer)
  - **Complete multilingual support** - Full translation coverage (EN, AR, FR)
- **Translation System Enhancement** - Comprehensive i18n implementation
  - Added complete client account translations in all 3 languages
  - Enhanced auth system translations with detailed error messages
  - Added missing common UI translations across all languages
  - Professional RTL support for Arabic interface
- **Language switcher redesign** - Replaced flag emojis with clean letter icons (🅴🅰🅵) from Tabler Icons
- **Mobile navbar improvements** - Added wishlist and icons to header, removed wishlist from drawer menu  
- **Mobile drawer consistency** - All navigation items follow icon + label + value format
- **Professional language selector** - Clean design with proper ARIA labels and RTL compatibility
- **RTL dropdown positioning** - Fixed Arabic mode dropdown/combobox alignment issues
- **Orders processing** - Resolved order flow issues from recent commits
- **Improved accessibility** - Better keyboard navigation and meaningful visual indicators
- **Client Account Integration Fix** - Fixed order creation to properly update user statistics
  - Order creation now updates `totalSpent` and `ordersCount` fields for authenticated users
  - Both public and admin order creation endpoints integrated with user stats
  - Created migration script to recalculate stats for existing users
  - Added transaction support to ensure data consistency
  - User dashboard now accurately reflects order history and spending
- **Order Creation 500 Error Fix** - Resolved frontend order creation failures
  - **Root cause**: Corrupted cart data with `variantId: "undefined"` strings causing `NaN` conversion errors
  - **Solution**: Enhanced data validation in checkout page to handle corrupted localStorage values
  - **Result**: Order creation now works reliably from browser interface
  - Added proper error handling for invalid productId and variantId values
  - Improved cart data sanitization to prevent similar issues in future
- **Context-Aware UX/UI Enhancements** - Personalized experience based on user authentication
  - **Smart Checkout**: Auto-populated forms for registered users with saved address data
  - **Multiple Address Support**: Dropdown selector for users with multiple saved addresses
  - **Fixed Account Sidebar**: Full-screen height pinned navigation for better account management
  - **Account Dropdown Menu**: Consolidated navbar with single dropdown containing all account actions
  - **Context-Aware Wishlist**: Separate routes for guests (`/wishlist`) vs registered users (`/account/wishlist`)
  - **Responsive Design**: Mobile-friendly layouts maintained across all enhancements