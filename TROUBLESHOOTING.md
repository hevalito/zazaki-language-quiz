# Troubleshooting Guide for Zazaki Language Learning Game

## Issue 1: Highscores are still stored in localStorage instead of FaunaDB

If your highscores are still being stored in localStorage even though you've set up FaunaDB, here are some steps to troubleshoot:

### 1. Check the Browser Console for Errors

1. Open your deployed site
2. Right-click and select "Inspect" or press F12
3. Go to the "Console" tab
4. Look for any errors related to the Netlify functions or FaunaDB

Common errors might include:
- 404 errors for the Netlify functions (/.netlify/functions/getHighscores or /.netlify/functions/saveHighscore)
- Authentication errors with FaunaDB

### 2. Verify the Environment Variable

Make sure the `FAUNADB_SERVER_SECRET` environment variable is correctly set in Netlify:

1. Go to your Netlify dashboard
2. Select your site
3. Go to "Site settings" > "Environment variables"
4. Check if `FAUNADB_SERVER_SECRET` is set with the correct value
5. If you need to update it, click "Edit" and enter the correct value
6. After updating, trigger a new deploy by going to "Deploys" and clicking "Trigger deploy" > "Deploy site"

### 3. Check the Netlify Function Logs

1. Go to your Netlify dashboard
2. Select your site
3. Go to "Functions"
4. Click on "getHighscores" or "saveHighscore" to view the logs
5. Look for any errors in the logs

### 4. Verify the FaunaDB Setup

1. Log in to your FaunaDB dashboard
2. Select your database
3. Go to "Collections" and make sure the "highscores" collection exists
4. If it doesn't exist, create it manually:
   - Click "New Collection"
   - Name it "highscores"
   - Click "Save"

### 5. Test the FaunaDB Connection

You can use the included test script to verify your FaunaDB connection:

1. Set the environment variable locally:
   ```bash
   export FAUNADB_SERVER_SECRET=your-fauna-secret-key
   ```

2. Run the test script:
   ```bash
   node test-faunadb.js
   ```

3. The script will:
   - Test the connection to FaunaDB
   - Check if the highscores collection exists (and create it if it doesn't)
   - Add a test highscore
   - Retrieve highscores to verify everything is working

### 6. Test the Functions Locally

You can test the Netlify functions locally to see if they work:

1. Install the Netlify CLI globally if you haven't already:
   ```bash
   npm install -g netlify-cli
   ```

2. Set the environment variable locally:
   ```bash
   export FAUNADB_SERVER_SECRET=your-fauna-secret-key
   ```

3. Run the Netlify dev server:
   ```bash
   netlify dev
   ```

4. Test the functions by visiting:
   - http://localhost:8888/.netlify/functions/getHighscores
   - You can test saveHighscore using a tool like Postman or curl

## Issue 2: Accessing the Admin Panel

The admin panel is available at the `/admin.html` path of your deployed site. For example, if your site is deployed at `https://zazaki-game.netlify.app`, the admin panel would be at `https://zazaki-game.netlify.app/admin.html`.

### Default Admin Credentials

- Username: `admin`
- Password: `zazaki123`

### If You Can't Access the Admin Panel

1. Make sure the admin.html file is included in your deployment
2. Check if there are any console errors when trying to access the admin panel
3. If you've changed the admin credentials and forgotten them, you'll need to reset them by:
   - Editing the localStorage directly in the browser console:
     ```javascript
     localStorage.setItem('zazakiGameAdmin', JSON.stringify({username: 'admin', password: 'zazaki123'}));
     ```
   - Or by redeploying the site with the default credentials

### 7. Use the Function Tester Tool

I've created a special tool to help you test your Netlify Functions directly:

1. Access the function tester at `/function-tester.html` on your deployed site
   (e.g., `https://your-site.netlify.app/function-tester.html`)

2. This tool provides three tests:
   - Test getHighscores Function: Directly calls the getHighscores function
   - Test saveHighscore Function: Lets you save a test highscore
   - Environment Check: Verifies your Netlify Functions setup

3. The results will help identify where the issue might be:
   - If the functions work in the tester but not in the game, there might be an issue with the game's integration
   - If the functions fail in the tester too, there's likely an issue with the functions or FaunaDB setup

## Additional Troubleshooting

If you're still having issues, try the following:

1. Clear your browser cache and cookies
2. Try accessing the site in an incognito/private browsing window
3. Try a different browser
4. Check if your browser has any extensions that might be blocking the requests
5. Check the browser console for detailed error messages (press F12 to open)
6. Verify that your FaunaDB database and collection are set up correctly
7. Make sure the FAUNADB_SERVER_SECRET environment variable is set correctly in Netlify

If none of these solutions work, you may need to check your Netlify build configuration to ensure that the functions are being properly deployed.
