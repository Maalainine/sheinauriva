#!/usr/bin/env npx tsx

/**
 * Script to recalculate and update user statistics (totalSpent, ordersCount)
 * This is useful for migrating existing data or fixing inconsistent stats
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserStats() {
  console.log('Starting user stats update...');

  try {
    // Get all users with CLIENT role
    const users = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: { id: true, name: true, email: true },
    });

    console.log(`Found ${users.length} client users to update`);

    for (const user of users) {
      console.log(`Processing user: ${user.name} (${user.email})`);

      // Calculate user's order statistics
      const userOrders = await prisma.order.findMany({
        where: { userId: user.id },
        select: { total: true },
      });

      const ordersCount = userOrders.length;
      const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);

      // Update user stats
      await prisma.user.update({
        where: { id: user.id },
        data: {
          ordersCount,
          totalSpent,
        },
      });

      console.log(`  Updated: ${ordersCount} orders, ${totalSpent} MAD total spent`);
    }

    console.log('User stats update completed successfully!');
  } catch (error) {
    console.error('Error updating user stats:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script if called directly
if (require.main === module) {
  updateUserStats();
}

export { updateUserStats };
