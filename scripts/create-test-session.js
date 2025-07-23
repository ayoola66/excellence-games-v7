const { createSession } = require('../lib/session');

async function generateTestSession() {
  // We can use any user ID and email here, since the role is hardcoded to 'admin'
  await createSession(1, 'test@example.com');
}

generateTestSession();
