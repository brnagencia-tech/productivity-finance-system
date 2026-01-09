const bcrypt = require('bcryptjs');

const password = 'karen123';
const hash = bcrypt.hashSync(password, 10);
console.log('Hash para karen123:', hash);
