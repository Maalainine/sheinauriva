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

- **🔄 Icon Library Migration (Phase 1 - Partially Complete)**
  - **Completed**: CartDrawer.tsx, VariantEditor.tsx (2/24 files)
  - **Remaining**: 22 files with Lucide icons need conversion to Tabler
  - **Files**: ProductActions.tsx, ProductsTable.tsx, SearchDrawer.tsx, admin components, etc.
  - **Next Steps**: Complete systematic replacement of all Lucide → Tabler icons

### Admin Panel Enhancement (Priority 1)

**✅ Already Complete:**
- Admin authentication and authorization system
- Product management with full variant support (CRUD, categories, brands, tags)
- Dashboard with basic metrics and low stock alerts
- Professional admin UI with responsive sidebar

**✅ Phase 1: Order Management System (COMPLETED)**
- `/admin/orders` - Professional orders listing with search, filters, and pagination
- `/admin/orders/[id]` - Comprehensive order details with customer profiles  
- Basic order status workflow (PENDING → CONFIRMED → SHIPPED → DELIVERED → CANCELLED)
- Full API endpoints with admin authentication and validation
- Order tracking, notes, and customer communication features
- Revenue analytics and status-based summaries

**✅ Phase 2: Customer Management (COMPLETED)**
- `/admin/customers` - Professional customer listing with search, filters, and analytics dashboard
- `/admin/customers/[id]` - Comprehensive customer profiles with order history and insights  
- Customer analytics with spending patterns, order frequency, and registration trends
- Full API endpoints with admin authentication and validation
- Customer activity timeline with order history and wishlist tracking
- Shipping address management and customer demographics

**🎯 Phase 3: Enhanced Order Management (PRIORITY 1)**
- **Order Status Management**: Ability to change order statuses directly from admin panel
- **Order Details Enhancement**: Improved order detail views with full edit capabilities
- **Cross-Navigation**: Direct order access from customer profiles and vice versa
- **Admin Notifications**: Real-time notifications when new orders are placed
- **Order Workflow**: Complete order lifecycle management with proper state transitions

**🎯 Phase 4: Settings & Configuration (Priority 2)**
- **Fix `/admin/settings` 404 error**: Create proper settings page and routing
- **Site Configuration**: Basic site settings, contact info, and branding
- **Admin Preferences**: Notification settings and admin user management
- **System Configuration**: Payment settings, shipping zones, and email templates

**🎯 Phase 5: Notification System (Priority 3)**
- **Real-time Notifications**: WebSocket or polling-based notification system
- **Email Notifications**: Order confirmation and status change emails
- **Admin Alerts**: Dashboard notifications for new orders, low stock, etc.
- **Notification Preferences**: Customizable notification settings per admin user

### Recently Completed ✅
- **Admin Panel Enhancement System (2025-09-30)** - Completed comprehensive admin panel improvements
  - **✅ Order Status Management**: Full order status update functionality with dropdown selection in order detail pages
  - **✅ Cross-Navigation**: Seamless navigation between orders and customers (customers can view orders, orders link to customer profiles)
  - **✅ Settings Page**: Created comprehensive `/admin/settings` page with general, commerce, feature, and notification preferences
  - **✅ Admin Notification System**: Real-time notification system for new orders and status changes
    - Notification bell component in admin sidebar with unread badges
    - Automatic notifications for new orders (guest and registered customers)
    - Status change notifications when orders are updated
    - Configurable notification preferences in settings
    - Clean notification management (mark as read, delete, clear all)
    - Smart linking to relevant admin pages from notifications
- **Development Database Full Reset & Comprehensive Seeding (2025-09-30)** - Complete dev environment setup
  - **Database Reset**: Fresh PostgreSQL database with proper schema sync
  - **Comprehensive Seed Data**: 15 total orders (9 guest orders + 6 registered client orders)
  - **User Data**: 4 users (1 admin + 3 clients), 3 products, complete order lifecycle examples
  - **Order Variety**: Multiple statuses (PENDING, PROCESSING, CONFIRMED, SHIPPED, DELIVERED)
  - **Result**: Full-featured development environment with realistic test data
- **Admin Panel TypeError Fixes (2025-09-30)** - Resolved order ID display errors
  - **Root cause**: Order IDs are integers but code expected strings for .substring() method
  - **Fixed Locations**: 5 files across admin panel (orders, customers, order details, APIs)
  - **Solution**: Convert `order.id` to string using `.toString()` before substring operations
  - **Result**: All admin pages now display order IDs correctly without runtime errors
- **Admin Panel Status Configuration Fix (2025-09-30)** - Added missing order status icons
  - **Root cause**: statusConfig missing PENDING and PROCESSING status definitions
  - **Added Statuses**: PENDING (IconClock), PROCESSING (IconLoader) with proper colors
  - **Result**: All order statuses now have proper icon and color representations
- **Production Database Compatibility Fix (2025-09-30)** - Fixed images field data type mismatch
  - **Root cause**: Production DB had image arrays, dev had comma-separated strings
  - **Solution**: Enhanced API to handle both formats gracefully
  - **Result**: Both dev and production databases now work with same codebase
- **Database Schema Fix (2025-09-26)** - Resolved SQLite/PostgreSQL mismatch
  - **Root cause**: Local dev was using SQLite (`file:./dev.db`) but deployment requires PostgreSQL
  - **Solution**: Updated Prisma schema from `provider = "sqlite"` to `provider = "postgresql"`
  - **Impact**: Fixed products, orders, and customers not fetching from API endpoints
  - **Status**: Schema corrected, pending PostgreSQL installation and proper DATABASE_URL configuration
- **Icon Migration Progress (2025-09-26)** - Started Lucide to Tabler conversion
  - **Progress**: 2 of 24 files completed (CartDrawer.tsx, VariantEditor.tsx)
  - **Icons converted**: X→IconX, Plus→IconPlus, Minus→IconMinus, Trash2→IconTrash, etc.
  - **Remaining**: 22 files still using Lucide icons need systematic conversion
  - **API Endpoint Discovery** - Identified correct API structure
  - **Products API**: `/api/public/products` (not `/api/products`)
  - **Response format**: `{products: Product[], total: number}` - correctly structured
  - **Admin APIs**: `/api/admin/orders`, `/api/admin/customers` - endpoints exist and properly configured
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
- **Admin Panel Routing Fix** - Resolved authentication routing conflicts between client and admin systems
  - **Root cause**: NextAuth pages configuration redirecting all auth errors to client login
  - **Solution**: Updated `lib/auth.ts` to remove conflicting signIn page configuration
  - **Enhanced middleware**: Separate authentication flows for `/admin` vs `/account` routes
  - **Added error page**: Created `/auth/error` for authentication error handling
  - **Result**: Clean separation between admin (`/admin/login`) and client (`/login`) authentication flows
  - Admin panel now properly accessible at `/admin` with correct login redirect
- **Admin Panel Root Redirect Fix** - Resolved `/admin` redirecting to root instead of dashboard after login
  - **Root cause**: Server-side session timing issue in `/app/admin/page.tsx` using `getServerSession()`
  - **Solution**: Converted to client-side component using `useSession()` hook with proper loading states
  - **Result**: `/admin` now correctly redirects to `/admin/dashboard` after successful admin authentication
  - **Smart Checkout**: Auto-populated forms for registered users with saved address data
  - **Multiple Address Support**: Dropdown selector for users with multiple saved addresses
  - **Fixed Account Sidebar**: Full-screen height pinned navigation for better account management
  - **Account Dropdown Menu**: Consolidated navbar with single dropdown containing all account actions
  - **Context-Aware Wishlist**: Separate routes for guests (`/wishlist`) vs registered users (`/account/wishlist`)
  - **Responsive Design**: Mobile-friendly layouts maintained across all enhancements
- **Checkout UX Improvements for Registered Users** - Streamlined checkout process
  - **Auto-populated checkout forms**: Registered users see pre-filled name, address, city, and country
  - **Address dropdown**: Clean selection of saved addresses without redundant country/city fields
  - **Hidden form fields**: Country and city dropdowns hidden when saved addresses are available
  - **Duplicate address prevention**: Server-side deduplication of address entries
  - **RTL compatibility**: All checkout improvements work correctly in Arabic layout
  - **Translation completeness**: All checkout elements properly translated in EN/AR/FR
- **Mobile Navbar Account Integration** - Better mobile navigation experience
  - **Account dropdown in header**: Moved account access from mobile drawer to main navbar
  - **Strategic positioning**: Account button placed between search and cart for optimal UX
  - **Consistent dropdown**: Same account menu structure across desktop and mobile
  - **Clean mobile drawer**: Drawer now focuses on navigation and language settings only
  - **RTL support**: Account dropdown positioning works correctly in Arabic mode