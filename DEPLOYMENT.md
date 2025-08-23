# Deployment Guide for Zazaki Language Learning Game

This guide will walk you through the process of deploying the Zazaki Language Learning Game to Netlify with FaunaDB for global highscores.

## 1. Create a FaunaDB Account and Database

1. Go to [https://dashboard.fauna.com/accounts/register](https://dashboard.fauna.com/accounts/register)
2. Fill out the registration form with your information
3. Verify your email address
4. Log in to your FaunaDB account
5. Create a new database:
   - Click "Create Database"
   - Name it "zazaki-game" (or any name you prefer)
   - Select "Classic" as the Region Group
   - Click "Create"

## 2. Set Up the FaunaDB Collection

1. In your new database, go to the "Collections" tab
2. Click "New Collection"
3. Name it "highscores"
4. Click "Save"

## 3. Create a Server Key

1. Go to the "Security" tab
2. Click "New Key"
3. Set the following options:
   - Role: Server
   - Database: zazaki-game (or the name you chose)
4. Click "Save"
5. **IMPORTANT**: Copy the secret key that is displayed. This will only be shown once!

## 4. Deploy to Netlify

### Option 1: Use the Automated Deployment Scripts (Recommended)

I've created two deployment scripts that automate the entire process:

#### Method A: Interactive Script

1. Make sure the script is executable:
   ```bash
   chmod +x deploy.sh
   ```

2. Run the script:
   ```bash
   ./deploy.sh
   ```

3. The script will:
   - Check if you're logged in to Netlify
   - Ask for your FaunaDB server secret
   - Link your project to a Netlify site (or use an existing one)
   - Set the environment variable
   - Build and deploy your project

#### Method B: Non-Interactive Script (If Method A Doesn't Work)

If you have issues with the interactive script (e.g., can't enter the FaunaDB secret), use this alternative:

1. Make sure the script is executable:
   ```bash
   chmod +x deploy-with-secret.sh
   ```

2. Run the script with your FaunaDB secret as an argument:
   ```bash
   ./deploy-with-secret.sh your-fauna-secret-key
   ```

3. This script works the same way but doesn't require interactive input.

#### Method C: Using Environment Variables

You can also set the FaunaDB secret as an environment variable before running the script:

1. Set the environment variable:
   ```bash
   export FAUNADB_SERVER_SECRET=your-fauna-secret-key
   ```

2. Run the script:
   ```bash
   ./deploy.sh
   ```

3. The script will detect the environment variable and use it automatically.

### Option 2: Deploy via Netlify CLI Manually

1. Navigate to your project directory:
   ```bash
   cd /Users/jakob/Projects/zazaki-game
   ```

2. Link your project to a new Netlify site:
   ```bash
   netlify init
   ```
   - Select "Create & configure a new site"
   - Choose your team
   - Enter a site name (or leave blank for a random name)

3. Set the FaunaDB secret as an environment variable:
   ```bash
   netlify env:set FAUNADB_SERVER_SECRET your-fauna-secret-key
   ```

4. Deploy your site:
   ```bash
   netlify deploy --prod
   ```

### Option 3: Deploy via Netlify Dashboard

1. Build your project:
   ```bash
   cd /Users/jakob/Projects/zazaki-game
   npm run build
   ```

2. Go to [https://app.netlify.com/](https://app.netlify.com/)
3. Click "New site from Git"
4. Connect to your Git provider and select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"
7. Once deployed, go to "Site settings" > "Environment variables"
8. Add a new variable:
   - Key: `FAUNADB_SERVER_SECRET`
   - Value: Your FaunaDB secret key
9. Trigger a new deploy for the environment variable to take effect

## 5. Test Your Deployment

### Testing the Game

1. Visit your deployed site (Netlify will provide the URL)
2. Play the game and submit a highscore
3. Verify that the highscore is saved globally by:
   - Opening the game in a different browser or device
   - Checking if your highscore appears in the list

### Testing the Netlify Functions

I've included a special tool to help you test your Netlify Functions:

1. Access the function tester at `/function-tester.html` on your deployed site
   (e.g., `https://your-site.netlify.app/function-tester.html`)

2. This tool provides three tests:
   - Test getHighscores Function: Directly calls the getHighscores function
   - Test saveHighscore Function: Lets you save a test highscore
   - Environment Check: Verifies your Netlify Functions setup

3. If the functions work in the tester but not in the game, there might be an issue with the game's integration
   If the functions fail in the tester too, there's likely an issue with the functions or FaunaDB setup

### Testing FaunaDB Connection

You can also test your FaunaDB connection directly:

1. Set the environment variable locally:
   ```bash
   export FAUNADB_SERVER_SECRET=your-fauna-secret-key
   ```

2. Run the test script:
   ```bash
   node test-faunadb.js
   ```

3. The script will verify your connection to FaunaDB and test the highscores collection

## Troubleshooting

If you encounter issues with the FaunaDB integration:

1. Check the browser console for errors
2. Verify that the `FAUNADB_SERVER_SECRET` environment variable is set correctly
3. Make sure the "highscores" collection exists in your FaunaDB database
4. Check the Netlify Function logs in the Netlify dashboard under "Functions"

## Additional Resources

- [FaunaDB Documentation](https://docs.fauna.com/)
- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
