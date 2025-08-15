import { PrismaClient, UserRole, Prisma } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const email = 'maelk1820@gmail.com';
    const password = 'Cosmo652879';
    const name = 'maalainine';
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`User with email ${email} already exists. Updating to admin role...`);
      
      // Update existing user to admin
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          name,
          role: UserRole.ADMIN,
          password: await hash(password, 12), // Update password
        },
      });
      
      console.log('Admin user updated successfully:', {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      });
    } else {
      // Create new admin user
      const hashedPassword = await hash(password, 12);
      
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: UserRole.ADMIN,
          totalSpent: new Prisma.Decimal(0),
          ordersCount: 0,
        },
      });
      
      console.log('Admin user created successfully:', {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      });
    }
  } catch (error) {
    console.error('Error creating/updating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createAdminUser()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
