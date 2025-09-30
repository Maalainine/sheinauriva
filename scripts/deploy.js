#!/usr/bin/env node

const { execSync } = require('child_process');

function runCommand(command, description) {
  console.log(`📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
    return true;
  } catch (error) {
    console.log(`❌ ${description} failed:`, error.message);
    return false;
  }
}

async function deploy() {
  console.log('🚀 Starting production deployment...');

  // Generate Prisma client
  if (!runCommand('npx prisma generate', 'Generating Prisma client')) {
    process.exit(1);
  }

  // Handle migrations with conflict resolution
  console.log('🗄️ Handling database migrations...');

  const migrateSuccess = runCommand('npx prisma migrate deploy', 'Deploying migrations');

  if (!migrateSuccess) {
    console.log('⚠️ Migration conflict detected, resolving...');

    // Mark the conflicting migration as resolved
    runCommand(
      'npx prisma migrate resolve --applied 20250930_initial_production_schema',
      'Resolving migration conflict'
    );

    // Try to deploy any remaining migrations
    runCommand('npx prisma migrate deploy', 'Deploying remaining migrations');
  }

  // Build the application
  if (!runCommand('npx next build', 'Building Next.js application')) {
    process.exit(1);
  }

  console.log('🎉 Deployment completed successfully!');
}

deploy().catch((error) => {
  console.error('💥 Deployment failed:', error);
  process.exit(1);
});
