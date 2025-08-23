# Production Issues Fix Guide

After analyzing the production site at https://zazakigame2.netlify.app/, I've identified several issues that need to be fixed:

## Issues Identified

1. **Admin Panel (404 Error)**: The admin.html page is not accessible
2. **Function Tester (404 Error)**: The function-tester.html page is not accessible
3. **Netlify Functions (500 Errors)**: The serverless functions are failing with 500 errors
4. **FaunaDB Integration**: The FaunaDB connection is failing

## Fix Steps

### 1. Fix the Build Process

The issue with the admin.html and function-tester.html pages is likely due to the build process not including these files in the final build. Let's fix this by creating a proper build script:

1. Create a `build.js` file in the project root:

```javascript
// build.js
const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Copy admin.html and function-tester.html to dist
fs.copyFileSync('src/admin.html', 'dist/admin.html');
fs.copyFileSync('function-tester.html', 'dist/function-tester.html');

// Copy admin.css to dist
fs.copyFileSync('src/admin.css', 'dist/admin.css');

console.log('Admin panel and function tester files copied to dist folder');
```

2. Update the build script in package.json:

```json
"scripts": {
  "build": "vite build && node build.js"
}
```

### 2. Fix the Netlify Functions

The 500 errors in the Netlify functions are likely due to issues with the FaunaDB connection. Let's add better error handling:

1. Update the getHighscores.js function:

```javascript
// Add this at the top of the file for debugging
console.log('FAUNADB_SERVER_SECRET exists:', !!process.env.FAUNADB_SERVER_SECRET);

// In the try-catch block, add more detailed error logging
try {
  // Existing code...
} catch (error) {
  console.error('Detailed error in getHighscores:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    env: !!process.env.FAUNADB_SERVER_SECRET
  });
  
  // Rest of the error handling...
}
```

2. Do the same for saveHighscore.js and other functions.

### 3. Fix the FaunaDB Environment Variable

The most likely issue is that the FaunaDB environment variable is not set correctly in Netlify:

1. Go to the Netlify dashboard
2. Select your site (zazakigame2)
3. Go to "Site settings" > "Environment variables"
4. Check if `FAUNADB_SERVER_SECRET` is set
5. If it's not set, add it with your FaunaDB secret key
6. If it is set, try updating it with a new value

### 4. Fix the Netlify Redirects

The redirects in netlify.toml might not be working correctly. Let's create a _redirects file which has higher priority:

1. Create a file named `_redirects` in the project root:

```
# Redirects for specific files
/admin.html /admin.html 200
/function-tester.html /function-tester.html 200

# Netlify function redirects
/.netlify/functions/* /.netlify/functions/:splat 200

# Fallback redirect for SPA
/* /index.html 200
```

2. Update the build.js script to copy this file:

```javascript
// Copy _redirects to dist
fs.copyFileSync('_redirects', 'dist/_redirects');
```

## Deployment Steps

1. Make the changes above
2. Commit the changes to your repository
3. Deploy to Netlify using one of these methods:

   a. Using the Netlify CLI:
   ```bash
   netlify deploy --prod
   ```

   b. Using the Netlify dashboard:
   - Go to your site
   - Go to "Deploys"
   - Click "Trigger deploy" > "Deploy site"

4. After deployment, check the Function logs in the Netlify dashboard:
   - Go to "Functions"
   - Click on a function to see its logs
   - Look for any errors

## Testing the Fix

1. Visit the main site: https://zazakigame2.netlify.app/
2. Check the browser console for errors
3. Try to access the admin panel: https://zazakigame2.netlify.app/admin.html
4. Try to access the function tester: https://zazakigame2.netlify.app/function-tester.html
5. Test the Netlify functions directly:
   - https://zazakigame2.netlify.app/.netlify/functions/getHighscores
   - https://zazakigame2.netlify.app/.netlify/functions/getQuestions

If you still encounter issues, please check the Netlify function logs for more detailed error information.
