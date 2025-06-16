const axios = require('axios');

async function createAdmin() {
  const strapiUrl = 'http://localhost:1337';
  
  try {
    // Create super admin user
    const response = await axios.post(`${strapiUrl}/admin/users/register-admin`, {
      email: 'superadmin@elitegames.com',
      password: 'Passw0rd',
      firstname: 'Super',
      lastname: 'Admin'
    });

    console.log('Admin user created successfully:', response.data);

    // Create regular user
    const userResponse = await axios.post(`${strapiUrl}/api/auth/local/register`, {
      username: 'premiumuser',
      email: 'premium@elitegames.com',
      password: 'Passw0rd',
      fullName: 'Premium User',
      subscriptionStatus: 'premium',
      premiumExpiry: '2025-12-31'
    });

    console.log('Premium user created successfully:', userResponse.data);
  } catch (error) {
    console.error('Failed to create users:', error.response?.data || error.message);
  }
}

createAdmin();