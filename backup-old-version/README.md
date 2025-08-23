# Zazaki Language Learning Game

A text-based browser game for learning the Zazaki (Kurdish) language. Players answer multiple-choice questions to learn vocabulary and phrases in Zazaki.

## Features

- Multiple choice questions with text, image, and audio support
- Level progression system
- Score tracking
- Global highscores
- Save/load game functionality
- Admin panel for managing questions and levels

## Technical Overview

The game is built using vanilla JavaScript, HTML, and CSS. It uses:

- Vite for development and building
- Netlify for hosting and serverless functions
- FaunaDB for global highscore storage

## Setup Instructions

### Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

### FaunaDB Setup for Global Highscores

To enable global highscores, you need to set up a FaunaDB database:

1. Create a FaunaDB account at [https://fauna.com/](https://fauna.com/)
2. Create a new database (e.g., "zazaki-game")
3. In the FaunaDB Console, create a new collection named "highscores"
4. Create a new server key with access to the database
5. Add the FaunaDB server key to your Netlify environment variables:
   - Go to your Netlify site settings
   - Navigate to "Environment variables"
   - Add a new variable named `FAUNADB_SERVER_SECRET` with your server key as the value

### Deployment

The game is set up for deployment to Netlify:

1. Push your code to a Git repository
2. Connect your repository to Netlify
3. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add the FaunaDB server key as an environment variable in Netlify

## Project Structure

- `src/` - Source code
  - `js/` - JavaScript modules
    - `admin.js` - Admin panel functionality
    - `data.js` - Game data and configuration
    - `game.js` - Core game logic
    - `storage.js` - Save/load and highscore functionality
    - `ui.js` - UI rendering and interaction
  - `index.html` - Main game page
  - `admin.html` - Admin panel
  - `style.css` - Main styles
  - `admin.css` - Admin panel styles
- `data/` - JSON data files
  - `questions.json` - Default questions
  - `highscores.json` - Default highscores
- `netlify/functions/` - Serverless functions
  - `getHighscores.js` - Function to retrieve global highscores
  - `saveHighscore.js` - Function to save a new highscore

## Global Highscores Implementation

The game uses FaunaDB and Netlify Functions to store and retrieve highscores globally:

1. When a player achieves a highscore, it's sent to the `saveHighscore` serverless function
2. The function stores the highscore in FaunaDB
3. When viewing highscores, the game calls the `getHighscores` function to retrieve the global list
4. If the API calls fail, the game falls back to using localStorage

This implementation ensures that highscores are available across all devices while maintaining offline functionality.

## Admin Access

The admin panel allows you to manage questions and levels:

- URL: `/admin.html`
- Default credentials:
  - Username: `admin`
  - Password: `zazaki123`

## License

MIT
