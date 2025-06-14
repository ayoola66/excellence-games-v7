const axios = require('axios');

async function main() {
    const strapiUrl = 'http://localhost:1337';
    
    // Admin credentials to update
    const adminCredentials = {
        email: 'superadmin@elitegames.com',
        password: 'Passw0rd'
    };

    // User credentials to update
    const userCredentials = {
        identifier: 'premium@elitegames.com',
        password: 'Passw0rd'
    };

    try {
        // Test admin login
        console.log('\nTesting admin login...');
        const adminResponse = await axios.post(`${strapiUrl}/admin/login`, adminCredentials);
        console.log('Admin login successful!', adminResponse.data);
    } catch (error) {
        console.error('Admin login failed:', error.response?.data || error.message);
        
        // If admin login fails, try to create/update admin
        try {
            console.log('\nAttempting to create/update admin user...');
            const createAdminResponse = await axios.post(`${strapiUrl}/admin/users/register-admin`, {
                email: adminCredentials.email,
                password: adminCredentials.password,
                firstname: 'Super',
                lastname: 'Admin',
                roles: [1] // Assuming 1 is the Super Admin role ID
            });
            console.log('Admin user created/updated successfully!');
        } catch (createError) {
            console.error('Failed to create/update admin:', createError.response?.data || createError.message);
        }
    }

    try {
        // Test regular user login
        console.log('\nTesting regular user login...');
        const userResponse = await axios.post(`${strapiUrl}/api/auth/local`, userCredentials);
        console.log('User login successful!', userResponse.data);
    } catch (error) {
        console.error('User login failed:', error.response?.data || error.message);
        
        // If user login fails, try to create/update user
        try {
            console.log('\nAttempting to create/update regular user...');
            const createUserResponse = await axios.post(`${strapiUrl}/api/auth/local/register`, {
                username: 'premiumuser',
                email: userCredentials.identifier,
                password: userCredentials.password,
                subscriptionStatus: 'premium',
                premiumExpiry: '2025-12-31',
                fullName: 'Premium User',
                phone: '+44 20 1234 5678',
                address: '123 Premium Street, London, UK'
            });
            console.log('Regular user created/updated successfully!');
        } catch (createError) {
            console.error('Failed to create/update user:', createError.response?.data || createError.message);
        }
    }
}

main().catch(console.error); 