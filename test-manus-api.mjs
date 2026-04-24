#!/usr/bin/env node

/**
 * Manus API Verification Script
 * 
 * This script tests if your Manus API credentials are working correctly.
 * 
 * Usage:
 *   node test-manus-api.mjs
 * 
 * Make sure .env.local is configured first!
 */

import dotenv from 'dotenv';
import https from 'https';
import { URL } from 'url';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

async function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(body);
    }

    req.end();
  });
}

async function testEnvironmentVariables() {
  logSection('1. Environment Variables Check');

  const required = [
    'BUILT_IN_FORGE_API_KEY',
    'BUILT_IN_FORGE_API_URL',
    'VITE_APP_ID',
    'OAUTH_SERVER_URL',
    'JWT_SECRET',
    'OWNER_OPEN_ID'
  ];

  let allSet = true;

  for (const key of required) {
    const value = process.env[key];
    if (value) {
      const masked = value.length > 20 ? value.substring(0, 10) + '...' + value.substring(value.length - 5) : value;
      logSuccess(`${key} = ${masked}`);
    } else {
      logError(`${key} is not set`);
      allSet = false;
    }
  }

  return allSet;
}

async function testAPIConnectivity() {
  logSection('2. API Connectivity Test');

  const apiUrl = process.env.BUILT_IN_FORGE_API_URL;
  const apiKey = process.env.BUILT_IN_FORGE_API_KEY;

  if (!apiUrl || !apiKey) {
    logError('API URL or Key not set. Skipping connectivity test.');
    return false;
  }

  try {
    const url = new URL(apiUrl);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: '/health',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'NewsVerifier-Test/1.0'
      }
    };

    log(`Testing connection to: ${apiUrl}`, 'blue');
    
    const response = await makeRequest(options);

    if (response.status === 200 || response.status === 401) {
      logSuccess(`API is reachable (Status: ${response.status})`);
      return true;
    } else if (response.status === 401) {
      logError(`API key is invalid (Status: 401)`);
      return false;
    } else {
      logWarning(`Unexpected status code: ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Cannot connect to API: ${error.message}`);
    return false;
  }
}

async function testLLMAPI() {
  logSection('3. LLM API Test');

  const apiUrl = process.env.BUILT_IN_FORGE_API_URL;
  const apiKey = process.env.BUILT_IN_FORGE_API_KEY;

  if (!apiUrl || !apiKey) {
    logError('API URL or Key not set. Skipping LLM test.');
    return false;
  }

  try {
    const url = new URL(apiUrl);
    
    const payload = JSON.stringify({
      messages: [
        {
          role: 'system',
          content: 'You are a content credibility analyzer. Respond with a JSON object containing: score (0-100), redFlags (array), and summary (string).'
        },
        {
          role: 'user',
          content: 'Analyze this claim for credibility: "The Earth is flat"'
        }
      ],
      max_tokens: 500
    });

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'User-Agent': 'NewsVerifier-Test/1.0'
      }
    };

    log('Sending test request to LLM API...', 'blue');
    
    const response = await makeRequest(options, payload);

    if (response.status === 200) {
      logSuccess('LLM API call successful');
      try {
        const data = JSON.parse(response.body);
        if (data.choices && data.choices[0]) {
          log(`Response: ${data.choices[0].message.content.substring(0, 100)}...`, 'blue');
        }
      } catch (e) {
        log(`Raw response: ${response.body.substring(0, 100)}...`, 'blue');
      }
      return true;
    } else if (response.status === 401) {
      logError(`LLM API authentication failed (Status: 401)`);
      logError('Check your BUILT_IN_FORGE_API_KEY');
      return false;
    } else {
      logError(`LLM API error (Status: ${response.status})`);
      log(`Response: ${response.body.substring(0, 200)}`, 'yellow');
      return false;
    }
  } catch (error) {
    logError(`LLM API test failed: ${error.message}`);
    return false;
  }
}

async function testDatabaseConnection() {
  logSection('4. Database Connection Test');

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    logError('DATABASE_URL not set');
    return false;
  }

  try {
    // Parse connection string
    const url = new URL(databaseUrl);
    const host = url.hostname;
    const port = url.port || 3306;
    const user = url.username;
    const database = url.pathname.substring(1);

    logSuccess(`Database URL parsed:`);
    log(`  Host: ${host}`, 'blue');
    log(`  Port: ${port}`, 'blue');
    log(`  User: ${user}`, 'blue');
    log(`  Database: ${database}`, 'blue');

    // Note: We can't actually test the connection without mysql2 package
    logWarning('Note: Database connection test requires mysql2 package');
    logWarning('To test: pnpm db:push');

    return true;
  } catch (error) {
    logError(`Invalid DATABASE_URL: ${error.message}`);
    return false;
  }
}

async function testOAuthConfiguration() {
  logSection('5. OAuth Configuration Check');

  const appId = process.env.VITE_APP_ID;
  const oauthUrl = process.env.OAUTH_SERVER_URL;
  const portalUrl = process.env.VITE_OAUTH_PORTAL_URL;

  if (!appId) {
    logError('VITE_APP_ID not set');
    return false;
  }

  if (!oauthUrl) {
    logError('OAUTH_SERVER_URL not set');
    return false;
  }

  if (!portalUrl) {
    logError('VITE_OAUTH_PORTAL_URL not set');
    return false;
  }

  logSuccess('OAuth configuration is set:');
  log(`  App ID: ${appId}`, 'blue');
  log(`  OAuth URL: ${oauthUrl}`, 'blue');
  log(`  Portal URL: ${portalUrl}`, 'blue');

  return true;
}

async function runAllTests() {
  console.clear();
  log('╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║         Manus API Verification Script                      ║', 'cyan');
  log('║         Testing NewsVerifier Configuration                 ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');

  const results = {
    environment: await testEnvironmentVariables(),
    connectivity: await testAPIConnectivity(),
    llm: await testLLMAPI(),
    database: await testDatabaseConnection(),
    oauth: await testOAuthConfiguration()
  };

  logSection('Summary');

  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;

  log(`Tests passed: ${passed}/${total}`, passed === total ? 'green' : 'yellow');

  if (passed === total) {
    logSuccess('All tests passed! Your configuration is ready.');
    logSuccess('You can now run: pnpm dev');
  } else {
    logWarning('Some tests failed. Please check the errors above.');
    logWarning('Make sure all environment variables are set in .env.local');
  }

  console.log('\n');
}

// Run tests
runAllTests().catch(error => {
  logError(`Fatal error: ${error.message}`);
  process.exit(1);
});
