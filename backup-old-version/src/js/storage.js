/**
 * Storage module for the Zazaki game
 * Handles saving and loading game data, highscores, etc.
 */

import { gameConfig } from './data.js';

// Flag to determine if we should use FaunaDB or localStorage
const USE_FAUNADB = true; // Set to true to use FaunaDB with EU region endpoint

/**
 * Save a game state
 * @param {Object} gameState - The game state to save
 * @returns {boolean} - Whether the save was successful
 */
export function saveGameState(gameState) {
    try {
        // Generate a save ID based on player name and timestamp
        const saveId = `${gameState.player.name.replace(/\s+/g, '_')}_${Date.now()}`;
        
        // Create a save object with metadata
        const saveData = {
            id: saveId,
            player: gameState.player,
            currentQuestionIndex: gameState.currentQuestionIndex,
            timestamp: Date.now(),
            displayName: `${gameState.player.name} (Level ${gameState.player.level}, Score ${gameState.player.score})`
        };
        
        // Get existing saves
        const existingSaves = getSavedGames();
        
        // Add new save
        existingSaves.push(saveData);
        
        // Save to localStorage
        localStorage.setItem(gameConfig.saveGamePrefix, JSON.stringify(existingSaves));
        
        return true;
    } catch (error) {
        console.error('Error saving game:', error);
        return false;
    }
}

/**
 * Get all saved games
 * @returns {Array} - Array of saved games
 */
export function getSavedGames() {
    try {
        const savedGames = localStorage.getItem(gameConfig.saveGamePrefix);
        return savedGames ? JSON.parse(savedGames) : [];
    } catch (error) {
        console.error('Error loading saved games:', error);
        return [];
    }
}

/**
 * Load a saved game
 * @param {string} saveId - ID of the save to load
 * @returns {Object|null} - The loaded game state or null if not found
 */
export function loadSavedGame(saveId) {
    try {
        const savedGames = getSavedGames();
        const saveData = savedGames.find(save => save.id === saveId);
        return saveData || null;
    } catch (error) {
        console.error('Error loading saved game:', error);
        return null;
    }
}

/**
 * Delete a saved game
 * @param {string} saveId - ID of the save to delete
 * @returns {boolean} - Whether the deletion was successful
 */
export function deleteSavedGame(saveId) {
    try {
        let savedGames = getSavedGames();
        savedGames = savedGames.filter(save => save.id !== saveId);
        localStorage.setItem(gameConfig.saveGamePrefix, JSON.stringify(savedGames));
        return true;
    } catch (error) {
        console.error('Error deleting saved game:', error);
        return false;
    }
}

/**
 * Save a highscore
 * @param {Object} highscore - The highscore to save
 * @returns {Promise<boolean>} - Whether the save was successful
 */
export async function saveHighscore(highscore) {
    console.log('🔍 Saving highscore:', highscore);
    
    if (USE_FAUNADB) {
        try {
            console.log('📡 Saving to FaunaDB...');
            const response = await fetch('/.netlify/functions/saveHighscore', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(highscore)
            });
            
            console.log('📊 Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('✅ Highscore saved successfully:', result);
            return true;
        } catch (error) {
            console.error('❌ Error saving highscore to FaunaDB:', error);
            console.log('⚠️ Falling back to localStorage for highscore');
            
            // Fallback to localStorage
            return saveHighscoreToLocalStorage(highscore);
        }
    } else {
        console.log('📋 Saving to localStorage (FaunaDB disabled)');
        return saveHighscoreToLocalStorage(highscore);
    }
}

/**
 * Save a highscore to localStorage
 * @param {Object} highscore - The highscore to save
 * @returns {boolean} - Whether the save was successful
 */
function saveHighscoreToLocalStorage(highscore) {
    try {
        // Get existing highscores
        const highscores = getHighscoresFromLocalStorage();
        
        // Add new highscore
        highscores.push(highscore);
        
        // Sort by score (descending)
        highscores.sort((a, b) => b.score - a.score);
        
        // Limit to max highscores
        const limitedHighscores = highscores.slice(0, gameConfig.maxHighscores);
        
        // Save to localStorage
        localStorage.setItem(gameConfig.highscorePrefix, JSON.stringify(limitedHighscores));
        
        console.log('✅ Highscore saved to localStorage');
        return true;
    } catch (error) {
        console.error('❌ Error saving highscore to localStorage:', error);
        return false;
    }
}

/**
 * Get highscores from localStorage
 * @returns {Array} - Array of highscores
 */
function getHighscoresFromLocalStorage() {
    try {
        const highscores = localStorage.getItem(gameConfig.highscorePrefix);
        return highscores ? JSON.parse(highscores) : [];
    } catch (error) {
        console.error('Error loading highscores from localStorage:', error);
        return [];
    }
}

/**
 * Get all highscores
 * @returns {Promise<Array>} - Array of highscores
 */
export async function getHighscores() {
    console.log('🔍 Attempting to fetch highscores...');
    
    if (USE_FAUNADB) {
        try {
            console.log('🔍 Attempting to fetch highscores from FaunaDB...');
            console.log('📡 Fetching from: /.netlify/functions/getHighscores');
            
            const response = await fetch('/.netlify/functions/getHighscores');
            console.log('📊 Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const highscores = await response.json();
            console.log(`✅ Retrieved ${highscores.length} highscores from FaunaDB`);
            return highscores;
        } catch (error) {
            console.error('❌ Error loading highscores from FaunaDB:', error);
            console.log('⚠️ Falling back to localStorage for highscores');
            
            // Fallback to localStorage
            const localHighscores = getHighscoresFromLocalStorage();
            console.log(`📋 Retrieved ${localHighscores.length} highscores from localStorage`);
            return localHighscores;
        }
    } else {
        console.log('📋 Using localStorage for highscores (FaunaDB disabled)');
        const localHighscores = getHighscoresFromLocalStorage();
        console.log(`📋 Retrieved ${localHighscores.length} highscores from localStorage`);
        return localHighscores;
    }
}

/**
 * Check if a score qualifies for the highscore list
 * @param {number} score - The score to check
 * @returns {Promise<boolean>} - Whether the score qualifies
 */
export async function checkHighscoreQualification(score) {
    try {
        const highscores = await getHighscores();
        
        // If we have fewer than max highscores, any score qualifies
        if (highscores.length < gameConfig.maxHighscores) {
            return true;
        }
        
        // Otherwise, check if the score is higher than the lowest highscore
        const lowestHighscore = highscores[highscores.length - 1];
        return score > lowestHighscore.score;
    } catch (error) {
        console.error('Error checking highscore qualification:', error);
        // Default to true if there's an error
        return true;
    }
}
