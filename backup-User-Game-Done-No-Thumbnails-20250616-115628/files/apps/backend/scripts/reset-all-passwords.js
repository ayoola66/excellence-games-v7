const crypto = require('crypto');

module.exports = {
  async up(knex) {
    // Hash the password 'Passw0rd'
    const password = 'Passw0rd';
    const salt = crypto.randomBytes(16).toString('base64');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('base64');

    // Update all users with the new password
    await knex('up_users')
      .update({
        password: `${salt}$${hash}`,
        updated_at: new Date()
      });

    console.log('All user passwords have been reset to: Passw0rd');
  }
}; 