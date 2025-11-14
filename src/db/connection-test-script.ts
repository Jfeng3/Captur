import 'dotenv/config';
import { db } from './drizzle-client';
import { sql } from 'drizzle-orm';

async function testConnection() {
  try {
    console.log('Testing Drizzle ORM connection to Supabase...\n');
    
    // List all tables in the public schema
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('Tables in your Supabase database:');
    console.log('================================');
    tables.forEach((row: any) => {
      console.log(`- ${row.table_name}`);
    });
    
    // Get row counts for each table
    console.log('\nTable row counts:');
    console.log('================');
    
    for (const row of tables as any[]) {
      const countResult = await db.execute(sql`
        SELECT COUNT(*) as count FROM ${sql.identifier(row.table_name)}
      `);
      console.log(`- ${row.table_name}: ${countResult[0].count} rows`);
    }
    
    console.log('\n✅ Connection successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  }
}

testConnection();