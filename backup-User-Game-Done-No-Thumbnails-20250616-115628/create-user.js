const axios = require('axios');

async function createUser() {
  const strapiUrl = 'http://localhost:1337';
  
  try {
    // Create premium user
    const response = await axios.post(`${strapiUrl}/api/auth/local/register`, {
      username: 'premiumuser',
      email: 'premium@elitegames.com',
      password: 'Passw0rd',
      fullName: 'Premium User',
      subscriptionStatus: 'premium',
      premiumExpiry: '2025-12-31'
    });

    console.log('Premium user created successfully:', response.data);
  } catch (error) {
    console.error('Failed to create user:', error.response?.data || error.message);
  }
}

createUser();