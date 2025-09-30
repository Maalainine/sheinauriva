const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateImagesToArray() {
  try {
    console.log('🔄 Starting migration: Converting product images from comma-separated strings to arrays');

    // Get all products with images
    const products = await prisma.product.findMany({
      where: {
        images: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        images: true
      }
    });

    console.log(`📊 Found ${products.length} products with images to migrate`);

    let converted = 0;
    let skipped = 0;

    for (const product of products) {
      if (typeof product.images === 'string') {
        // Convert comma-separated string to array
        const imageArray = product.images
          .split(',')
          .map(url => url.trim())
          .filter(url => url.length > 0);

        // Use raw SQL to update since we're changing the data type
        await prisma.$executeRaw`
          UPDATE "Product"
          SET images = ${imageArray}::text[]
          WHERE id = ${product.id}
        `;

        console.log(`✅ Converted product "${product.name}" (${product.images}) → [${imageArray.join(', ')}]`);
        converted++;
      } else {
        console.log(`⏭️  Skipped product "${product.name}" - already array format`);
        skipped++;
      }
    }

    console.log(`🎉 Migration completed:`);
    console.log(`   - Converted: ${converted} products`);
    console.log(`   - Skipped: ${skipped} products`);
    console.log(`   - Total processed: ${products.length} products`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateImagesToArray()
  .then(() => {
    console.log('✅ Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
