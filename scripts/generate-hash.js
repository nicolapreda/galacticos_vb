const bcrypt = require('bcrypt');

const password = process.argv[2] || 'admin123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
    if (err) {
        console.error(err);
        return;
    }
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);
});
