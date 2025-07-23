const axios = require('axios');

async function fixPermissions() {
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

    const roles = rolesResponse.data.roles;
    const authenticatedRole = roles.find(role => role.name === 'Authenticated');
    const frontendAdminRole = roles.find(role => role.name === 'Frontend_Admin');

    // Update Authenticated role permissions
    console.log('Updating Authenticated role permissions...');
    await axios.put(`http://localhost:1337/api/users-permissions/roles/${authenticatedRole.id}`, {
      role: {
        ...authenticatedRole,
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

    // Update Frontend_Admin role permissions
    if (frontendAdminRole) {
      console.log('Updating Frontend_Admin role permissions...');
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

    console.log('Permissions updated successfully!');

  } catch (error) {
    console.error('Failed to update permissions:', error.response?.data || error.message);
  }
}

fixPermissions();