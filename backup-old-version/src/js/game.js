import { getQuestions, getLevels, gameConfig } from './data.js';
import * as ui from './ui.js';
import * as storage from './storage.js';

// Game state
let gameState = {
    player: {
        name: '',
        score: 0,
        level: 1,
        correctAnswers: 0
    },
    currentQuestionIndex: 0,
    questions: [],
    levels: [],
    gameStarted: false,
    gameFinished: false
};

/**
 * Initialize the game
 */
export async function initGame() {
    try {
        // Set up game data
        gameState.questions = await getQuestions();
        gameState.levels = [...getLevels()];
        
        // Load highscores
        try {
            const highscores = await storage.getHighscores();
            ui.displayHighscores(highscores);
        } catch (error) {
            console.error('Error loading highscores:', error);
            ui.displayHighscores([]);
        }
        
        // Load saved games
        const savedGames = storage.getSavedGames();
        ui.displaySavedGames(savedGames, loadGame, deleteSavedGame);
        
        // Set up event listeners
        setupEventListeners();
        
        console.log('Zazaki Language Learning Game initialized');
    } catch (error) {
        console.error('Error initializing game:', error);
        ui.showError('Failed to initialize game. Please try refreshing the page.');
    }
}

/**
 * Set up event listeners for game controls
 */
function setupEventListeners() {
    // Welcome Screen
    ui.elements.startGameButton.addEventListener('click', startNewGame);
    
    // Game Screen
    ui.elements.saveGameButton.addEventListener('click', saveGame);
    ui.elements.quitGameButton.addEventListener('click', quitGame);
    
    // Results Screen
    ui.elements.saveScoreButton.addEventListener('click', saveHighscore);
    ui.elements.playAgainButton.addEventListener('click', resetGame);
    ui.elements.returnHomeButton.addEventListener('click', returnToHome);
    
    // Feedback Modal
    ui.elements.nextQuestionButton.addEventListener('click', loadNextQuestion);
}

/**
 * Start a new game
 */
function startNewGame() {
    const playerName = ui.elements.playerNameInput.value.trim();
    
    if (!playerName) {
        alert('Please enter your name to start the game.');
        return;
    }
    
    // Initialize game state
    gameState.player.name = playerName;
    gameState.player.score = 0;
    gameState.player.level = 1;
    gameState.player.correctAnswers = 0;
    gameState.currentQuestionIndex = 0;
    gameState.gameStarted = true;
    gameState.gameFinished = false;
    
    // Shuffle questions
    shuffleQuestions();
    
    // Update UI
    ui.updatePlayerInfo(gameState.player);
    
    // Show game screen
    ui.showScreen(ui.elements.gameScreen);
    
    // Load first question
    loadQuestion();
}

/**
 * Load the current question
 */
function loadQuestion() {
    const question = gameState.questions[gameState.currentQuestionIndex];
    
    // Update question counter
    ui.updateQuestionCounter(gameState.currentQuestionIndex, gameState.questions.length);
    
    // Display question
    ui.displayQuestion(question);
    
    // Generate options
    ui.generateOptions(question, selectOption);
}

/**
 * Handle option selection
 * @param {HTMLElement} optionElement - The selected option element
 * @param {string} selectedOption - The selected option text
 */
function selectOption(optionElement, selectedOption) {
    const question = gameState.questions[gameState.currentQuestionIndex];
    const isCorrect = selectedOption === question.correctAnswer;
    
    // Highlight selected option
    ui.highlightOption(optionElement, question.correctAnswer, isCorrect);
    
    // Update game state
    if (isCorrect) {
        gameState.player.score += question.points;
        gameState.player.correctAnswers++;
        updateLevel();
    }
    
    // Update score display
    ui.updatePlayerInfo(gameState.player);
    
    // Show feedback
    ui.showFeedback(isCorrect, question.correctAnswer);
}

/**
 * Load the next question
 */
function loadNextQuestion() {
    // Hide feedback modal
    ui.hideFeedback();
    
    // Move to next question or end game
    gameState.currentQuestionIndex++;
    
    if (gameState.currentQuestionIndex >= gameState.questions.length) {
        endGame();
    } else {
        loadQuestion();
    }
}

/**
 * End the game and show results
 */
async function endGame() {
    gameState.gameFinished = true;
    
    // Check if score qualifies for highscores
    let qualifiesForHighscore = true;
    try {
        qualifiesForHighscore = await storage.checkHighscoreQualification(gameState.player.score);
    } catch (error) {
        console.error('Error checking highscore qualification:', error);
        // Default to true if there's an error
        qualifiesForHighscore = true;
    }
    
    // Update results screen
    ui.updateResultsScreen({
        score: gameState.player.score,
        level: gameState.player.level,
        correctAnswers: gameState.player.correctAnswers,
        totalQuestions: gameState.questions.length
    }, qualifiesForHighscore);
    
    // Show results screen
    ui.showScreen(ui.elements.resultsScreen);
}

/**
 * Save the current game
 */
function saveGame() {
    if (!gameState.gameStarted || gameState.gameFinished) {
        return;
    }
    
    const success = storage.saveGameState(gameState);
    
    if (success) {
        alert('Game saved successfully!');
        
        // Refresh saved games list
        const savedGames = storage.getSavedGames();
        ui.displaySavedGames(savedGames, loadGame, deleteSavedGame);
    } else {
        alert('Failed to save game. Please try again.');
    }
}

/**
 * Load a saved game
 * @param {string} saveId - ID of the saved game
 */
function loadGame(saveId) {
    const saveData = storage.loadSavedGame(saveId);
    
    if (!saveData) {
        alert('Save data not found!');
        return;
    }
    
    // Restore game state
    gameState.player = saveData.player;
    gameState.currentQuestionIndex = saveData.currentQuestionIndex;
    gameState.gameStarted = true;
    gameState.gameFinished = false;
    
    // Update UI
    ui.updatePlayerInfo(gameState.player);
    
    // Show game screen
    ui.showScreen(ui.elements.gameScreen);
    
    // Load current question
    loadQuestion();
}

/**
 * Delete a saved game
 * @param {string} saveId - ID of the saved game to delete
 */
function deleteSavedGame(saveId) {
    const success = storage.deleteSavedGame(saveId);
    
    if (success) {
        // Refresh saved games list
        const savedGames = storage.getSavedGames();
        ui.displaySavedGames(savedGames, loadGame, deleteSavedGame);
    } else {
        alert('Failed to delete saved game. Please try again.');
    }
}

/**
 * Save a highscore
 */
async function saveHighscore() {
    const highscoreEntry = {
        name: gameState.player.name,
        score: gameState.player.score,
        level: gameState.player.level,
        date: new Date().toISOString()
    };
    
    try {
        const success = await storage.saveHighscore(highscoreEntry);
        
        if (success) {
            // Hide highscore entry section
            document.getElementById('highscore-entry').style.display = 'none';
            
            // Refresh highscores display
            const highscores = await storage.getHighscores();
            ui.displayHighscores(highscores);
            
            alert('Your score has been saved!');
        } else {
            alert('Failed to save highscore. Please try again.');
        }
    } catch (error) {
        console.error('Error saving highscore:', error);
        alert('Failed to save highscore. Please try again.');
    }
}

/**
 * Update player level based on score
 */
function updateLevel() {
    // Find the appropriate level based on score
    const newLevel = gameState.levels.find(level => 
        gameState.player.score >= level.requiredPoints
    );
    
    if (newLevel && newLevel.level > gameState.player.level) {
        gameState.player.level = newLevel.level;
    }
}

/**
 * Shuffle the questions array
 */
function shuffleQuestions() {
    // Fisher-Yates shuffle algorithm
    for (let i = gameState.questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameState.questions[i], gameState.questions[j]] = [gameState.questions[j], gameState.questions[i]];
    }
}

/**
 * Reset the game for a new round
 */
function resetGame() {
    // Reset game state
    gameState.player.score = 0;
    gameState.player.level = 1;
    gameState.player.correctAnswers = 0;
    gameState.currentQuestionIndex = 0;
    gameState.gameFinished = false;
    
    // Shuffle questions
    shuffleQuestions();
    
    // Update UI
    ui.updatePlayerInfo(gameState.player);
    
    // Show game screen
    ui.showScreen(ui.elements.gameScreen);
    
    // Load first question
    loadQuestion();
}

/**
 * Return to the home screen
 */
async function returnToHome() {
    // Show welcome screen
    ui.showScreen(ui.elements.welcomeScreen);
    
    // Refresh saved games and highscores
    const savedGames = storage.getSavedGames();
    ui.displaySavedGames(savedGames, loadGame, deleteSavedGame);
    
    try {
        const highscores = await storage.getHighscores();
        ui.displayHighscores(highscores);
    } catch (error) {
        console.error('Error loading highscores:', error);
        ui.displayHighscores([]);
    }
}

/**
 * Quit the current game
 */
function quitGame() {
    if (confirm('Are you sure you want to quit? Your progress will be lost unless you save.')) {
        returnToHome();
    }
}
