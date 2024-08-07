const bcrypt = require('bcrypt');

const saltRounds = 10;
const plainPassword = 'grana';

bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
  if (err) {
    console.error(err);
  } else {
    console.log(hash);
  }
});
