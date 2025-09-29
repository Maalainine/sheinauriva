#!/usr/bin/env tsx

/**
 * Script to fix production image data
 * Converts array image data to comma-separated strings to match schema
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixImagesData() {
  console.log('🔧 Starting image data migration...');

  try {
    // Get all products with raw SQL to see the actual data structure
    const products = await prisma.$queryRaw`
      SELECT id, name, images FROM "Product" WHERE images IS NOT NULL
    ` as Array<{id: number, name: string, images: any}>;

    console.log(`📦 Found ${products.length} products with images`);

    let fixedCount = 0;

    for (const product of products) {
      console.log(`Processing product: ${product.name} (ID: ${product.id})`);
      console.log(`Current images value:`, product.images);
      console.log(`Type: ${typeof product.images}`);

      let fixedImages: string | null = null;

      // If images is already a string, keep it
      if (typeof product.images === 'string') {
        console.log(`✅ Already a string, skipping ${product.name}`);
        continue;
      }

      // If it's an array, convert to comma-separated string
      if (Array.isArray(product.images)) {
        fixedImages = product.images.join(',');
        console.log(`🔄 Converting array to string: ${fixedImages}`);
      }

      // If it's a JSON string of array, parse and convert
      else if (typeof product.images === 'string' && product.images.startsWith('[')) {
        try {
          const imageArray = JSON.parse(product.images);
          if (Array.isArray(imageArray)) {
            fixedImages = imageArray.join(',');
            console.log(`🔄 Converting JSON array to string: ${fixedImages}`);
          }
        } catch (e) {
          console.log(`❌ Failed to parse JSON for ${product.name}:`, e);
          continue;
        }
      }

      // Update the product if we have a fixed value
      if (fixedImages !== null) {
        await prisma.product.update({
          where: { id: product.id },
          data: { images: fixedImages }
        });

        console.log(`✅ Fixed images for ${product.name}`);
        fixedCount++;
      }
    }

    console.log(`🎉 Migration completed! Fixed ${fixedCount} products.`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
fixImagesData()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
