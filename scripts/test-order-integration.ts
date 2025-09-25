#!/usr/bin/env npx tsx

/**
 * Test script to verify order creation integration with client account system
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testOrderIntegration() {
  console.log('Testing order creation integration...');

  try {
    // First, let's see current state
    console.log('\n=== Current State ===');

    const users = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: {
        id: true,
        name: true,
        email: true,
        totalSpent: true,
        ordersCount: true,
        orders: {
          select: { id: true, total: true }
        }
      },
    });

    for (const user of users) {
      console.log(`User: ${user.name} (${user.email})`);
      console.log(`  Stats: ${user.ordersCount} orders, ${user.totalSpent} MAD spent`);
      console.log(`  Actual orders: ${user.orders.length} orders, ${user.orders.reduce((sum, o) => sum + o.total, 0)} MAD total`);
      console.log('');
    }

    // Check for orders without userId
    const guestOrders = await prisma.order.count({
      where: { userId: null }
    });

    console.log(`Guest orders (no userId): ${guestOrders}`);

    // Check for orders with userId but user stats not updated
    const ordersWithUser = await prisma.order.findMany({
      where: { userId: { not: null } },
      include: { user: { select: { id: true, totalSpent: true, ordersCount: true } } },
    });

    console.log(`\nOrders with user association: ${ordersWithUser.length}`);

    if (ordersWithUser.length > 0) {
      console.log('Checking if user stats match actual order data...');

      for (const order of ordersWithUser) {
        if (order.user) {
          const userOrders = await prisma.order.findMany({
            where: { userId: order.userId! },
            select: { total: true }
          });

          const actualTotal = userOrders.reduce((sum, o) => sum + o.total, 0);
          const actualCount = userOrders.length;

          if (actualTotal !== order.user.totalSpent || actualCount !== order.user.ordersCount) {
            console.log(`⚠️  Mismatch for user ${order.userId}:`);
            console.log(`    Stored stats: ${order.user.ordersCount} orders, ${order.user.totalSpent} MAD`);
            console.log(`    Actual data: ${actualCount} orders, ${actualTotal} MAD`);
          } else {
            console.log(`✅  User ${order.userId} stats are correct`);
          }
        }
      }
    }

    console.log('\n=== Integration test completed ===');

  } catch (error) {
    console.error('Error testing integration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script if called directly
if (require.main === module) {
  testOrderIntegration();
}

export { testOrderIntegration };
