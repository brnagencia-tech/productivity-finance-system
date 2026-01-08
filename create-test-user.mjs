import mysql from 'mysql2/promise';

async function createTestUser() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'productivity_finance_system'
    });

    // Verificar se o usuário já existe
    const [existing] = await connection.execute(
      'SELECT id FROM managed_users WHERE email = ?',
      ['testuser@example.com']
    );

    if (existing.length > 0) {
      console.log('Usuário de teste já existe com ID:', existing[0].id);
      console.log('Email: testuser@example.com');
      console.log('Senha: password123');
      await connection.end();
      return;
    }

    // Criar novo usuário
    const passwordHash = Buffer.from('password123').toString('base64');
    
    await connection.execute(
      `INSERT INTO managed_users 
       (createdByUserId, username, firstName, lastName, email, phoneBR, phoneUS, passwordHash, isActive, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [1, 'testuser', 'Test', 'User', 'testuser@example.com', null, null, passwordHash, true]
    );

    console.log('✅ Usuário de teste criado com sucesso!');
    console.log('Email: testuser@example.com');
    console.log('Senha: password123');

    await connection.end();
  } catch (error) {
    console.error('Erro ao criar usuário:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

createTestUser();
