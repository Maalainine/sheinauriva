import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    // Test the connection
    const result = await prisma.$queryRaw`SELECT 1 as test_connection`;
    console.log('✅ Database connection successful!', result);
    
    // Optional: List all tables to verify schema access
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('📊 Database tables:', tables);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
