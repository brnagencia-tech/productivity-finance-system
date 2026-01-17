import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { managedUsers } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log('Fetching active users...');
const users = await db.select().from(managedUsers).where(eq(managedUsers.isActive, true));
console.log('Users found:', users.length);
users.forEach(u => {
  console.log(`ID: ${u.id}, Username: "${u.username}", Name: ${u.firstName} ${u.lastName}`);
});

// Testar busca por username específico
console.log('\n--- Testing getUserByUsername logic ---');
const testUsernames = ['teste', 'karen', 'ruan', 'bruno'];
for (const username of testUsernames) {
  const result = await db.select().from(managedUsers).where(eq(managedUsers.username, username)).limit(1);
  console.log(`Username "${username}": ${result.length > 0 ? 'FOUND ✓' : 'NOT FOUND ✗'}`);
  if (result.length > 0) {
    console.log(`  -> ID: ${result[0].id}, Full name: ${result[0].firstName} ${result[0].lastName}`);
  }
}

await connection.end();
