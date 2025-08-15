import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';

// Initialize Prisma client with the provided database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiMDFKWlMyMFJEMUZFSDVZS1BGVDlLRFlUWDciLCJ0ZW5hbnRfaWQiOiIxYzM3NmVhMTU4ZmUxNjg3ZDIyNmYxNzc2MTkwY2EyMWMzMjVlY2ZiNWMyMWUzZTAzYTgwYjUwMDQ1ODhlMzUxIiwiaW50ZXJuYWxfc2VjcmV0IjoiYmQ3OTdjN2ItYzY3Mi00ZjM3LWI4ZTgtMmY5M2Y3MWE5ZGFkIn0.8mc_ZR1wLmwUEslMYPdlLnwC7L07elDhxgU9zNugpds',
    },
  },
});

async function createAdminUsers() {
  try {
    console.log('Starting to create admin users...');

    // Admin user 1
    const admin1Email = 'maelk1820@gmail.com';
    const admin1Password = await hash('Cosmo652879', 10);
    
    const admin1 = await prisma.user.upsert({
      where: { email: admin1Email },
      update: {},
      create: {
        email: admin1Email,
        name: 'Mael Admin',
        password: admin1Password,
        role: UserRole.ADMIN,
        totalSpent: 0,
        ordersCount: 0,
        shippingAddresses: {
          create: {
            address1: 'Admin Address',
            city: 'Admin City',
            state: 'Admin State',
            postalCode: '00000',
            country: 'Adminland',
            isDefault: true,
          },
        },
      },
    });
    console.log(`Created admin user: ${admin1.email}`);

    // Admin user 2
    const admin2Email = 'abdobendahhane7@gmail.com';
    const admin2Password = await hash('Abdo2028', 10);
    
    const admin2 = await prisma.user.upsert({
      where: { email: admin2Email },
      update: {},
      create: {
        email: admin2Email,
        name: 'Abdo Admin',
        password: admin2Password,
        role: UserRole.ADMIN,
        totalSpent: 0,
        ordersCount: 0,
        shippingAddresses: {
          create: {
            address1: 'Admin Address',
            city: 'Admin City',
            state: 'Admin State',
            postalCode: '00000',
            country: 'Adminland',
            isDefault: true,
          },
        },
      },
    });
    console.log(`Created admin user: ${admin2.email}`);

    // Admin user 3
    const admin3Email = 'zakariiptv90@gmail.com';
    const admin3Password = await hash('zakariiptv90@gmail.com', 10);
    
    const admin3 = await prisma.user.upsert({
      where: { email: admin3Email },
      update: {},
      create: {
        email: admin3Email,
        name: 'Zakaria Admin',
        password: admin3Password,
        role: UserRole.ADMIN,
        totalSpent: 0,
        ordersCount: 0,
        shippingAddresses: {
          create: {
            address1: 'Admin Address',
            city: 'Admin City',
            state: 'Admin State',
            postalCode: '00000',
            country: 'Adminland',
            isDefault: true,
          },
        },
      },
    });
    console.log(`Created admin user: ${admin3.email}`);

    console.log('All admin users created successfully!');
  } catch (error) {
    console.error('Error creating admin users:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
createAdminUsers();
