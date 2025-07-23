import axios from 'axios';

const API_URL = process.env.STRAPI_API_URL || 'http://localhost:1337';
let authToken;
let refreshToken;

describe('Admin Authentication Flow', () => {
  // Helper to create test token
  const generateTestToken = async () => {
    const response = await axios.post(`${API_URL}/admin/auth/token`, {
      description: 'Test Token'
    }, {
      headers: {
        Authorization: `Bearer ${process.env.ADMIN_INITIAL_TOKEN}`
      }
    });
    return response.data;
  };

  beforeAll(async () => {
    // Generate a token for subsequent tests
    const tokenData = await generateTestToken();
    authToken = tokenData.token;
    refreshToken = tokenData.refreshToken;
  });

  test('should successfully generate admin token', async () => {
    const response = await axios.post(`${API_URL}/admin/auth/token`, {
      description: 'Integration Test Token'
    }, {
      headers: {
        Authorization: `Bearer ${process.env.ADMIN_INITIAL_TOKEN}`
      }
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('token');
    expect(response.data).toHaveProperty('refreshToken');
    expect(response.data).toHaveProperty('expiresIn');
  });

  test('should reject invalid initial token', async () => {
    await expect(axios.post(`${API_URL}/admin/auth/token`, {
      description: 'Test Token'
    }, {
      headers: {
        Authorization: 'Bearer invalid-token'
      }
    })).rejects.toThrow();
  });

  test('should access protected route with valid token', async () => {
    const response = await axios.get(`${API_URL}/admin/settings`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });

    expect(response.status).toBe(200);
  });

  test('should reject expired token', async () => {
    // Mock an expired token
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    
    await expect(axios.get(`${API_URL}/admin/settings`, {
      headers: {
        Authorization: `Bearer ${expiredToken}`
      }
    })).rejects.toThrow();
  });

  test('should regenerate token using refresh token', async () => {
    const response = await axios.post(`${API_URL}/admin/auth/refresh`, {}, {
      headers: {
        Authorization: `Bearer ${refreshToken}`
      }
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('token');
    expect(response.data).toHaveProperty('refreshToken');
    expect(response.data).toHaveProperty('expiresIn');

    // Update tokens for subsequent tests
    authToken = response.data.token;
    refreshToken = response.data.refreshToken;
  });

  test('should reject invalid refresh token', async () => {
    await expect(axios.post(`${API_URL}/admin/auth/refresh`, {}, {
      headers: {
        Authorization: 'Bearer invalid-refresh-token'
      }
    })).rejects.toThrow();
  });
});
