import mysql from 'mysql2/promise';

async function checkUsers() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'productivity_finance_system'
    });

    const [rows] = await connection.execute(
      'SELECT id, email, firstName, lastName, isActive FROM managed_users LIMIT 10'
    );
    
    console.log('Usuários Gerenciados:');
    console.log(JSON.stringify(rows, null, 2));
    
    await connection.end();
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

checkUsers();
