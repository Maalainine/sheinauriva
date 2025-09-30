# Deployment Guide

## Production Database Schema Sync

This repository now includes proper Prisma migrations to ensure production database matches development schema.

### What's Included

- **Migration Files**: `prisma/migrations/` - Contains the complete schema migration
- **Netlify Config**: `netlify.toml` - Configured for Next.js with Prisma deployment
- **Build Scripts**: Updated package.json with deployment-specific commands

### Deployment Process

When you push to GitHub and trigger Netlify deployment:

1. **Prisma Generate**: Generates Prisma client
2. **Prisma Migrate Deploy**: Applies any pending migrations to production database
3. **Next.js Build**: Builds the application
4. **API Compatibility**: Images are properly transformed for frontend compatibility

### Environment Variables Required

Make sure these are set in Netlify:

```bash
DATABASE_URL=your_production_postgresql_url
NEXTAUTH_URL=https://your-domain.netlify.app
NEXTAUTH_SECRET=your_secret_key
```

### Key Features Fixed

- ✅ **Image Display**: API now transforms string arrays to proper image objects
- ✅ **Schema Sync**: Migration ensures production matches development
- ✅ **Admin Panel**: Complete order/customer management system
- ✅ **Notifications**: Real-time admin notification system
- ✅ **User Management**: Full authentication and account system

### Migration Details

The initial migration (`20250930_initial_production_schema`) includes:

- All database tables and relationships
- Proper indexes for performance
- Foreign key constraints
- Enum types (UserRole, OrderStatus, NotificationType)
- Image arrays stored as PostgreSQL TEXT[]

### Build Command

Netlify will automatically run: `npm run build:netlify`

This ensures:
1. Prisma client is generated
2. Database migrations are applied
3. Application is built successfully

### Testing Deployment

After deployment, verify:
1. Images display correctly on product pages
2. Admin panel loads at `/admin`
3. API endpoints return proper data structure
4. Database schema is in sync

### Troubleshooting

If deployment fails:
1. Check DATABASE_URL is valid PostgreSQL connection
2. Verify environment variables are set
3. Check build logs for migration errors
4. Ensure database accepts connections from Netlify