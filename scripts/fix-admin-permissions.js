const axios = require('axios');

async function fixAdminPermissions() {
  try {
    // Login as admin
    console.log('Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:1337/api/auth/local', {
      identifier: 'superadmin@elitegames.com',
      password: 'Passw0rd',
    });

    const { jwt } = loginResponse.data;

    // Get all roles
    console.log('Getting roles...');
    const rolesResponse = await axios.get('http://localhost:1337/api/users-permissions/roles', {
      headers: {
        Authorization: `Bearer ${jwt}`,
      }
    });

    const frontendAdminRole = rolesResponse.data.roles.find(role => role.name === 'Frontend_Admin');
    
    if (!frontendAdminRole) {
      // Create Frontend_Admin role
      console.log('Creating Frontend_Admin role...');
      const createRoleResponse = await axios.post('http://localhost:1337/api/users-permissions/roles', {
        name: 'Frontend_Admin',
        description: 'Frontend admin role with full access',
        permissions: {
          'admin-auth': {
            controllers: {
              'admin-auth': {
                login: { enabled: true },
                logout: { enabled: true },
                verify: { enabled: true },
                regenerateToken: { enabled: true },
                getProfile: { enabled: true },
                updateProfile: { enabled: true },
              },
            },
          },
          'platform-admin': {
            controllers: {
              'platform-admin': {
                find: { enabled: true },
                findOne: { enabled: true },
                create: { enabled: true },
                update: { enabled: true },
                delete: { enabled: true },
              },
            },
          },
          'game': {
            controllers: {
              'game': {
                find: { enabled: true },
                findOne: { enabled: true },
                create: { enabled: true },
                update: { enabled: true },
                delete: { enabled: true },
              },
            },
          },
          'category': {
            controllers: {
              'category': {
                find: { enabled: true },
                findOne: { enabled: true },
                create: { enabled: true },
                update: { enabled: true },
                delete: { enabled: true },
              },
            },
          },
        },
      }, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        }
      });

      console.log('Frontend_Admin role created:', createRoleResponse.data);
    } else {
      // Update Frontend_Admin role permissions
      console.log('Updating Frontend_Admin permissions...');
      await axios.put(`http://localhost:1337/api/users-permissions/roles/${frontendAdminRole.id}`, {
        role: {
          ...frontendAdminRole,
          permissions: {
            'admin-auth': {
              controllers: {
                'admin-auth': {
                  login: { enabled: true },
                  logout: { enabled: true },
                  verify: { enabled: true },
                  regenerateToken: { enabled: true },
                  getProfile: { enabled: true },
                  updateProfile: { enabled: true },
                },
              },
            },
            'platform-admin': {
              controllers: {
                'platform-admin': {
                  find: { enabled: true },
                  findOne: { enabled: true },
                  create: { enabled: true },
                  update: { enabled: true },
                  delete: { enabled: true },
                },
              },
            },
            'game': {
              controllers: {
                'game': {
                  find: { enabled: true },
                  findOne: { enabled: true },
                  create: { enabled: true },
                  update: { enabled: true },
                  delete: { enabled: true },
                },
              },
            },
            'category': {
              controllers: {
                'category': {
                  find: { enabled: true },
                  findOne: { enabled: true },
                  create: { enabled: true },
                  update: { enabled: true },
                  delete: { enabled: true },
                },
              },
            },
          },
        },
      }, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        }
      });
    }

    // Update user's role
    console.log('Updating user role...');
    const userResponse = await axios.get('http://localhost:1337/api/users', {
      headers: {
        Authorization: `Bearer ${jwt}`,
      }
    });

    const adminUser = userResponse.data.find(user => user.email === 'superadmin@elitegames.com');
    if (adminUser) {
      await axios.put(`http://localhost:1337/api/users/${adminUser.id}`, {
        role: frontendAdminRole.id,
      }, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        }
      });
    }

    console.log('Permissions updated successfully!');

  } catch (error) {
    console.error('Failed to update permissions:', error.response?.data || error.message);
  }
}

fixAdminPermissions();