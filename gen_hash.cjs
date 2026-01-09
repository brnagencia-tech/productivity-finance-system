const bcrypt = require('bcryptjs');

const password = 'Bruno2026';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
