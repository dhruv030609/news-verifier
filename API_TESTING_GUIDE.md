# 🔌 Manus API Testing Guide - Local Development

Complete guide to test Manus API calls locally and verify your credentials are working.

## Table of Contents
1. [Overview](#overview)
2. [Which APIs Are Used](#which-apis-are-used)
3. [Test Methods](#test-methods)
4. [Using Postman](#using-postman)
5. [Using cURL](#using-curl)
6. [Using Node.js Scripts](#using-nodejs-scripts)
7. [Debugging API Issues](#debugging-api-issues)

---

## Overview

NewsVerifier uses these **Manus APIs**:
- **LLM API** - For content analysis and credibility scoring
- **Image Generation API** - For image verification
- **Storage API** - For file uploads (optional)
- **Notification API** - For user notifications (optional)

All API calls go through your **backend server** to keep credentials secure.

---

## Which APIs Are Used

### 1. LLM API (Main Analysis)

**Used for:** Analyzing content and generating credibility scores

**Endpoint:** `POST /api/trpc/analysis.submit`

**What happens:**
```
User submits content → Backend receives request → Backend calls Manus LLM API → 
LLM analyzes content → Results saved to local database → Frontend displays results
```

**Required credentials:**
- `BUILT_IN_FORGE_API_KEY` (server-side)
- `BUILT_IN_FORGE_API_URL`

### 2. Image Generation API (Optional)

**Used for:** Image verification and manipulation detection

**Endpoint:** `POST /api/trpc/imageVerification.analyze`

**Required credentials:**
- `BUILT_IN_FORGE_API_KEY` (server-side)
- `BUILT_IN_FORGE_API_URL`

### 3. Storage API (Optional)

**Used for:** Uploading files to cloud storage

**Required credentials:**
- `BUILT_IN_FORGE_API_KEY` (server-side)

### 4. Notification API (Optional)

**Used for:** Sending notifications to users

**Required credentials:**
- `BUILT_IN_FORGE_API_KEY` (server-side)

---

## Test Methods

### Method 1: Test via Browser (Easiest)

1. **Start your local app:**
   ```powershell
   pnpm dev
   ```

2. **Open http://localhost:3000**

3. **Click "Dev Login"** to log in

4. **Test Analysis:**
   - Click "Analyze Content"
   - Enter text: "The Earth is flat"
   - Click "Analyze"
   - Wait for results

5. **Check if it works:**
   - ✅ Results appear = APIs working
   - ❌ Error message = API issue

### Method 2: Test via Browser Console

1. **Open Developer Tools** (F12)
2. **Go to Console tab**
3. **Paste this code:**

```javascript
// Test if API is reachable
fetch('/api/trpc/analysis.submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    json: {
      contentType: 'text',
      content: 'Test content for analysis'
    }
  })
})
.then(res => res.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

4. **Check the response** in the console

### Method 3: Use Postman (Recommended for detailed testing)

#### Step 1: Install Postman
- Download from: https://www.postman.com/downloads/

#### Step 2: Create New Request

1. Click "+" to create new request
2. Set method to **POST**
3. Enter URL: `http://localhost:3000/api/trpc/analysis.submit`

#### Step 3: Add Headers

Click "Headers" tab and add:
```
Content-Type: application/json
```

#### Step 4: Add Body

Click "Body" tab, select "raw", and paste:
```json
{
  "json": {
    "contentType": "text",
    "content": "The COVID-19 vaccine contains microchips"
  }
}
```

#### Step 5: Send Request

Click "Send" button and check the response.

**Success response:**
```json
{
  "result": {
    "data": {
      "submissionId": 123,
      "status": "pending"
    }
  }
}
```

**Error response:**
```json
{
  "error": {
    "message": "API key invalid",
    "code": "UNAUTHORIZED"
  }
}
```

### Method 4: Use cURL (Command Line)

Open PowerShell and run:

```powershell
$body = @{
    json = @{
        contentType = "text"
        content = "Test content"
    }
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/trpc/analysis.submit" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

Or simpler version:

```powershell
curl -X POST http://localhost:3000/api/trpc/analysis.submit `
  -H "Content-Type: application/json" `
  -d '{\"json\":{\"contentType\":\"text\",\"content\":\"Test\"}}'
```

---

## Using Node.js Scripts

### Script 1: Test LLM API Connection

Create file: `test-api.js`

```javascript
const https = require('https');

// Your Manus credentials
const apiKey = process.env.BUILT_IN_FORGE_API_KEY;
const apiUrl = process.env.BUILT_IN_FORGE_API_URL;

console.log('Testing Manus API Connection...\n');
console.log('API URL:', apiUrl);
console.log('API Key:', apiKey ? '✓ Set' : '✗ Missing');

// Test 1: Check if API is reachable
console.log('\n1. Testing API Reachability...');

const testUrl = new URL(apiUrl);
const options = {
  hostname: testUrl.hostname,
  port: testUrl.port || 443,
  path: '/health',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  if (res.statusCode === 200) {
    console.log('✓ API is reachable');
  } else if (res.statusCode === 401) {
    console.log('✗ API key is invalid');
  } else {
    console.log('? Unexpected status code');
  }
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (data) console.log('Response:', data);
  });
});

req.on('error', (error) => {
  console.error('✗ Cannot reach API:', error.message);
});

req.end();
```

Run it:
```powershell
node test-api.js
```

### Script 2: Test Analysis API

Create file: `test-analysis.js`

```javascript
const https = require('https');

async function testAnalysisAPI() {
  const apiUrl = process.env.BUILT_IN_FORGE_API_URL;
  const apiKey = process.env.BUILT_IN_FORGE_API_KEY;

  console.log('Testing Analysis API...\n');

  const payload = JSON.stringify({
    messages: [
      {
        role: 'system',
        content: 'You are a content credibility analyzer.'
      },
      {
        role: 'user',
        content: 'Analyze this claim: The Earth is flat'
      }
    ]
  });

  const url = new URL(apiUrl);
  const options = {
    hostname: url.hostname,
    port: url.port || 443,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Content-Length': payload.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✓ API call successful');
          console.log('Response:', JSON.parse(data));
        } else {
          console.log('✗ API error:', res.statusCode);
          console.log('Response:', data);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('✗ Request failed:', error.message);
      reject(error);
    });

    req.write(payload);
    req.end();
  });
}

testAnalysisAPI().catch(console.error);
```

Run it:
```powershell
node test-analysis.js
```

---

## Debugging API Issues

### Issue 1: "API Key Invalid" Error

**Solution:**
1. Go to Manus dashboard → Settings → Secrets
2. Copy `BUILT_IN_FORGE_API_KEY` exactly
3. Paste into `.env.local`
4. Restart dev server: `Ctrl+C` then `pnpm dev`

### Issue 2: "Cannot Connect to API" Error

**Solution:**
1. Check internet connection
2. Verify API URL in `.env.local`:
   ```
   BUILT_IN_FORGE_API_URL=https://api.manus.im
   ```
3. Test with curl:
   ```powershell
   curl https://api.manus.im/health
   ```

### Issue 3: "Timeout" Error

**Solution:**
1. API is slow - wait longer
2. Check your internet speed
3. Try again - might be temporary

### Issue 4: "CORS Error" in Browser

**Solution:**
- This shouldn't happen because API calls go through your backend
- If you see CORS error, your backend isn't running
- Restart: `pnpm dev`

### Issue 5: "401 Unauthorized"

**Solution:**
1. API key is wrong or expired
2. Get fresh key from Manus dashboard
3. Update `.env.local`
4. Restart dev server

---

## How to Check Logs

### Backend Logs

When you run `pnpm dev`, watch the terminal for:

```
[2026-04-19T10:30:45.123Z] [API] Calling Manus LLM...
[2026-04-19T10:30:46.456Z] [API] Response received
[2026-04-19T10:30:46.789Z] [Analysis] Score: 65
```

### Browser Console Logs

Open Developer Tools (F12) → Console tab to see:
- API request details
- Response data
- Error messages

### Check Network Requests

1. Open Developer Tools (F12)
2. Go to Network tab
3. Perform an action (e.g., analyze content)
4. Look for requests to:
   - `/api/trpc/analysis.submit`
   - `api.manus.im` (external API calls)

---

## Environment Variables Checklist

Before testing, verify all these are set in `.env.local`:

```
✓ BUILT_IN_FORGE_API_KEY=abc123xyz...
✓ BUILT_IN_FORGE_API_URL=https://api.manus.im
✓ VITE_APP_ID=your_app_id
✓ OAUTH_SERVER_URL=https://api.manus.im
✓ VITE_OAUTH_PORTAL_URL=https://login.manus.im
✓ JWT_SECRET=your_secret
✓ OWNER_OPEN_ID=your_owner_id
✓ DATABASE_URL=mysql://root:root@localhost:3306/news_verifier
```

---

## API Response Examples

### Successful Analysis Response

```json
{
  "result": {
    "data": {
      "submissionId": 42,
      "status": "pending",
      "credibilityScore": 65,
      "findings": {
        "sourceReputation": "Medium",
        "evidenceCitations": 3,
        "redFlags": ["Unverified claim", "Sensational language"]
      }
    }
  }
}
```

### Error Response

```json
{
  "error": {
    "message": "Invalid API key",
    "code": "UNAUTHORIZED",
    "status": 401
  }
}
```

---

## Testing Checklist

Before deploying, verify:

- [ ] API key is valid
- [ ] API URL is correct
- [ ] Internet connection works
- [ ] Dev server starts without errors
- [ ] Can log in (Dev Login or OAuth)
- [ ] Can submit content for analysis
- [ ] Analysis completes successfully
- [ ] Results display correctly
- [ ] Dashboard shows analysis history
- [ ] No 404 or 500 errors

---

## Summary

**API Testing Methods:**
1. ✅ Browser UI - Easiest, visual feedback
2. ✅ Postman - Best for detailed testing
3. ✅ cURL - Quick command-line testing
4. ✅ Node.js scripts - Automated testing

**Common Issues:**
- Invalid API key → Update from Manus dashboard
- Cannot connect → Check internet and API URL
- Timeout → Wait longer or check internet speed
- 401 error → API key is wrong

**Next Steps:**
1. Test via browser UI first
2. If issues, check `.env.local`
3. Verify credentials in Manus dashboard
4. Restart dev server
5. Try again

---

**Need more help?** Check the logs in the terminal or browser console for specific error messages.
