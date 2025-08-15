import { PrismaClient } from '@prisma/client';

// Initialize Prisma client with the provided database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiMDFKWlMyMFJEMUZFSDVZS1BGVDlLRFlUWDciLCJ0ZW5hbnRfaWQiOiIxYzM3NmVhMTU4ZmUxNjg3ZDIyNmYxNzc2MTkwY2EyMWMzMjVlY2ZiNWMyMWUzZTAzYTgwYjUwMDQ1OGhlMzUxIiwiaW50ZXJuYWxfc2VjcmV0IjoiYmQ3OTdjN2ItYzY3Mi00ZjM3LWI4ZTgtMmY5M2Y3MWE5ZGFkIn0.8mc_ZR1wLmwUEslMYPdlLnwC7L07elDhxgU9zNugpds',
    },
  },
});

async function checkAdminUsers() {
  try {
    console.log('Checking admin users in the database...');
    
    // Check user 1
    const user1 = await prisma.user.findUnique({
      where: { email: 'maelk1820@gmail.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        createdAt: true,
      },
    });
    console.log('\nUser 1 (maelk1820@gmail.com):');
    console.log(JSON.stringify(user1, null, 2));

    // Check user 2
    const user2 = await prisma.user.findUnique({
      where: { email: 'abdobendahhane7@gmail.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        createdAt: true,
      },
    });
    console.log('\nUser 2 (abdobendahhane7@gmail.com):');
    console.log(JSON.stringify(user2, null, 2));

    // Check user 3
    const user3 = await prisma.user.findUnique({
      where: { email: 'zakariiptv90@gmail.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        createdAt: true,
      },
    });
    console.log('\nUser 3 (zakariiptv90@gmail.com):');
    console.log(JSON.stringify(user3, null, 2));

  } catch (error) {
    console.error('Error checking admin users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
checkAdminUsers();
