const strapiUrl = 'http://localhost:1337';

async function createAdminUser() {
  try {
    const response = await fetch(`${strapiUrl}/api/admin-users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          email: 'admin@elitegames.com',
          password: 'Passw0rd',
          fullName: 'Admin User',
          adminType: 'SA',
          badge: 'Super Admin',
          permissions: {
            games: ['create', 'read', 'update', 'delete'],
            users: ['read', 'update'],
            settings: ['read', 'update']
          },
          isActive: true
        }
      })
    });

    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser(); 