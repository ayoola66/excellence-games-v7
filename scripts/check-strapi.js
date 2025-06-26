#!/usr/bin/env node

/**
 * This script checks if the Strapi backend is running and accessible.
 * It can be used to diagnose connection issues between the frontend and backend.
 */

const http = require('http');
const https = require('https');

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const TIMEOUT = 5000; // 5 seconds

console.log(`\n📡 Checking Strapi connection at: ${STRAPI_URL}\n`);

function checkStrapiHealth() {
  return new Promise((resolve, reject) => {
    const client = STRAPI_URL.startsWith('https') ? https : http;
    const url = `${STRAPI_URL}/api/health`;
    
    const req = client.get(url, { timeout: TIMEOUT }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            resolve({ status: 'ok', data: response });
          } catch (e) {
            resolve({ status: 'error', message: 'Invalid JSON response', statusCode: res.statusCode });
          }
        } else {
          resolve({ status: 'error', message: `HTTP ${res.statusCode}`, statusCode: res.statusCode });
        }
      });
    });
    
    req.on('error', (err) => {
      reject({ status: 'error', message: err.message, code: err.code });
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject({ status: 'error', message: 'Connection timeout', code: 'TIMEOUT' });
    });
  });
}

async function checkAuthEndpoints() {
  const endpoints = [
    '/api/users/me',
    '/api/auth/local',
    '/api/games'
  ];
  
  console.log('🔍 Checking key API endpoints:');
  
  for (const endpoint of endpoints) {
    const url = `${STRAPI_URL}${endpoint}`;
    try {
      const client = STRAPI_URL.startsWith('https') ? https : http;
      
      await new Promise((resolve, reject) => {
        const req = client.get(url, { timeout: TIMEOUT }, (res) => {
          console.log(`  ${endpoint}: ${res.statusCode} ${res.statusMessage}`);
          resolve();
        });
        
        req.on('error', (err) => {
          console.log(`  ${endpoint}: ERROR - ${err.message}`);
          resolve();
        });
      });
    } catch (error) {
      console.log(`  ${endpoint}: ERROR - ${error.message}`);
    }
  }
}

async function main() {
  try {
    const healthResult = await checkStrapiHealth();
    
    if (healthResult.status === 'ok') {
      console.log('✅ Strapi is running and healthy!');
      console.log(`   Status: ${healthResult.data?.status || 'OK'}`);
      
      if (healthResult.data?.datetime) {
        console.log(`   Server time: ${new Date(healthResult.data.datetime).toLocaleString()}`);
      }
      
      await checkAuthEndpoints();
      
      console.log('\n🔧 Troubleshooting tips:');
      console.log('   - If endpoints return 401, this is normal for authenticated routes');
      console.log('   - Make sure your frontend is using the correct STRAPI_API_URL');
      console.log('   - Check that your cookies are being properly set and sent');
    } else {
      console.log('❌ Strapi health check failed!');
      console.log(`   Error: ${healthResult.message}`);
      console.log('\n🔧 Troubleshooting tips:');
      console.log('   1. Make sure Strapi is running (cd apps/backend && npm run develop)');
      console.log('   2. Check if the URL is correct in your .env file');
      console.log('   3. Verify there are no network issues or firewalls blocking the connection');
      console.log('   4. Check Strapi logs for errors');
    }
  } catch (error) {
    console.log('❌ Connection to Strapi failed!');
    console.log(`   Error: ${error.message}`);
    console.log(`   Code: ${error.code}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔴 Strapi server is not running or not accessible at this address.');
      console.log('\n🔧 Troubleshooting tips:');
      console.log('   1. Start the Strapi server: cd apps/backend && npm run develop');
      console.log('   2. Check if the URL is correct in your .env file');
      console.log('   3. Make sure the port is not blocked by a firewall');
    } else if (error.code === 'TIMEOUT') {
      console.log('\n🔴 Connection to Strapi timed out.');
      console.log('\n🔧 Troubleshooting tips:');
      console.log('   1. Check if Strapi is overloaded or frozen');
      console.log('   2. Restart the Strapi server');
      console.log('   3. Check network connectivity');
    }
  }
  
  console.log('\n📋 Connection Summary:');
  console.log(`   Backend URL: ${STRAPI_URL}`);
  console.log(`   Frontend URL: ${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}`);
  console.log('\n');
}

main(); 