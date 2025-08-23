/**
 * UI-related functions for the Zazaki game
 */

// DOM Elements
const welcomeScreen = document.getElementById('welcome-screen');
const gameScreen = document.getElementById('game-screen');
const resultsScreen = document.getElementById('results-screen');
const feedbackModal = document.getElementById('feedback-modal');

// Welcome Screen Elements
const playerNameInput = document.getElementById('player-name');
const startGameButton = document.getElementById('start-game');
const savedGamesList = document.getElementById('saved-games-list');
const noSavedGamesMessage = document.getElementById('no-saved-games');
const highscoresList = document.getElementById('highscores-list');

// Game Screen Elements
const playerNameDisplay = document.getElementById('player-name-display');
const levelDisplay = document.getElementById('level-display');
const scoreDisplay = document.getElementById('score-display');
const questionCounter = document.getElementById('question-counter');
const questionText = document.getElementById('question-text');
const imageContainer = document.getElementById('image-container');
const questionImage = document.getElementById('question-image');
const audioContainer = document.getElementById('audio-container');
const questionAudio = document.getElementById('question-audio');
const audioSource = document.getElementById('audio-source');
const optionsContainer = document.getElementById('options-container');
const saveGameButton = document.getElementById('save-game');
const quitGameButton = document.getElementById('quit-game');

// Results Screen Elements
const finalScore = document.getElementById('final-score');
const finalLevel = document.getElementById('final-level');
const correctAnswers = document.getElementById('correct-answers');
const highscoreEntry = document.getElementById('highscore-entry');
const saveScoreButton = document.getElementById('save-score');
const playAgainButton = document.getElementById('play-again');
const returnHomeButton = document.getElementById('return-home');

// Feedback Modal Elements
const feedbackTitle = document.getElementById('feedback-title');
const feedbackMessage = document.getElementById('feedback-message');
const nextQuestionButton = document.getElementById('next-question');

/**
 * Show a specific screen and hide others
 * @param {HTMLElement} screen - The screen to show
 */
export function showScreen(screen) {
    // Hide all screens
    welcomeScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    resultsScreen.classList.add('hidden');
    
    // Show the requested screen
    screen.classList.remove('hidden');
}

/**
 * Update player information display
 * @param {Object} player - Player data
 */
export function updatePlayerInfo(player) {
    playerNameDisplay.textContent = `Player: ${player.name}`;
    levelDisplay.textContent = `Level: ${player.level}`;
    scoreDisplay.textContent = `Score: ${player.score}`;
}

/**
 * Update question counter
 * @param {number} current - Current question index
 * @param {number} total - Total number of questions
 */
export function updateQuestionCounter(current, total) {
    questionCounter.textContent = `Question: ${current + 1}/${total}`;
}

/**
 * Display a question
 * @param {Object} question - Question data
 */
export function displayQuestion(question) {
    // Set question text
    questionText.textContent = question.question;
    
    // Handle media based on question type
    if (question.type === 'image') {
        imageContainer.classList.remove('hidden');
        audioContainer.classList.add('hidden');
        
        // Set image source with error handling
        questionImage.onerror = function() {
            // If image fails to load, show a placeholder message
            imageContainer.innerHTML = '<div class="placeholder-media">Image placeholder: ' + 
                question.imageUrl.split('/').pop() + '</div>';
        };
        questionImage.src = question.imageUrl;
    } else if (question.type === 'audio') {
        imageContainer.classList.add('hidden');
        audioContainer.classList.remove('hidden');
        
        // Set audio source with error handling
        audioSource.src = question.audioUrl;
        questionAudio.onerror = function() {
            // If audio fails to load, show a placeholder message
            audioContainer.innerHTML = '<div class="placeholder-media">Audio placeholder: ' + 
                question.audioUrl.split('/').pop() + '</div>';
        };
        questionAudio.load();
    } else {
        // Text question
        imageContainer.classList.add('hidden');
        audioContainer.classList.add('hidden');
    }
}

/**
 * Generate options for a question
 * @param {Object} question - Question data
 * @param {Function} onSelect - Callback for option selection
 */
export function generateOptions(question, onSelect) {
    // Clear previous options
    optionsContainer.innerHTML = '';
    
    // Create and append option elements
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.textContent = option;
        optionElement.dataset.option = option;
        
        // Add click event listener
        optionElement.addEventListener('click', () => onSelect(optionElement, option));
        
        optionsContainer.appendChild(optionElement);
    });
}

/**
 * Highlight selected option and show correct/incorrect
 * @param {HTMLElement} selectedElement - Selected option element
 * @param {string} correctAnswer - The correct answer
 * @param {boolean} isCorrect - Whether the selected option is correct
 */
export function highlightOption(selectedElement, correctAnswer, isCorrect) {
    const options = document.querySelectorAll('.option');
    options.forEach(opt => {
        opt.classList.remove('selected');
        
        // Disable further clicks
        opt.style.pointerEvents = 'none';
        
        // Highlight correct and incorrect answers
        if (opt.dataset.option === correctAnswer) {
            opt.classList.add('correct');
        } else if (opt.dataset.option === selectedElement.dataset.option && !isCorrect) {
            opt.classList.add('incorrect');
        }
    });
}

/**
 * Show feedback modal
 * @param {boolean} isCorrect - Whether the answer was correct
 * @param {string} correctAnswer - The correct answer
 */
export function showFeedback(isCorrect, correctAnswer) {
    feedbackTitle.textContent = isCorrect ? 'Correct!' : 'Incorrect';
    feedbackMessage.textContent = isCorrect 
        ? 'Well done! You got it right.' 
        : `The correct answer was: ${correctAnswer}`;
    feedbackTitle.style.color = isCorrect ? 'var(--correct-color)' : 'var(--incorrect-color)';
    
    feedbackModal.classList.remove('hidden');
}

/**
 * Hide feedback modal
 */
export function hideFeedback() {
    feedbackModal.classList.add('hidden');
}

/**
 * Update results screen
 * @param {Object} results - Game results
 * @param {boolean} qualifiesForHighscore - Whether the score qualifies for highscores
 */
export function updateResultsScreen(results, qualifiesForHighscore) {
    finalScore.textContent = `Your Score: ${results.score}`;
    finalLevel.textContent = `Your Level: ${results.level}`;
    correctAnswers.textContent = `Correct Answers: ${results.correctAnswers}/${results.totalQuestions}`;
    
    // Show/hide highscore entry
    highscoreEntry.style.display = qualifiesForHighscore ? 'block' : 'none';
}

/**
 * Display saved games
 * @param {Array} savedGames - Array of saved games
 * @param {Function} onLoad - Callback for loading a game
 * @param {Function} onDelete - Callback for deleting a game
 */
export function displaySavedGames(savedGames, onLoad, onDelete) {
    // Clear the list
    savedGamesList.innerHTML = '';
    
    if (savedGames.length === 0) {
        noSavedGamesMessage.style.display = 'block';
        return;
    }
    
    noSavedGamesMessage.style.display = 'none';
    
    // Add each saved game to the list
    savedGames.forEach(save => {
        const saveItem = document.createElement('div');
        saveItem.className = 'saved-game-item';
        
        const saveInfo = document.createElement('div');
        saveInfo.textContent = save.displayName;
        
        const loadButton = document.createElement('button');
        loadButton.textContent = 'Load';
        loadButton.addEventListener('click', () => onLoad(save.id));
        
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.style.backgroundColor = 'var(--incorrect-color)';
        deleteButton.addEventListener('click', () => onDelete(save.id));
        
        saveItem.appendChild(saveInfo);
        saveItem.appendChild(loadButton);
        saveItem.appendChild(deleteButton);
        
        savedGamesList.appendChild(saveItem);
    });
}

/**
 * Display highscores
 * @param {Array} highscores - Array of highscores
 */
export function displayHighscores(highscores) {
    // Clear the list
    highscoresList.innerHTML = '';
    
    if (highscores.length === 0) {
        const noScores = document.createElement('p');
        noScores.textContent = 'No highscores yet. Be the first!';
        highscoresList.appendChild(noScores);
        return;
    }
    
    // Sort highscores by score (descending)
    highscores.sort((a, b) => b.score - a.score);
    
    // Take top 5
    const topScores = highscores.slice(0, 5);
    
    // Add each highscore to the list
    topScores.forEach((score, index) => {
        const scoreItem = document.createElement('div');
        scoreItem.className = 'highscore-item';
        scoreItem.innerHTML = `
            <span>${index + 1}. ${score.name}</span>
            <span>${score.score} points (Level ${score.level})</span>
        `;
        
        highscoresList.appendChild(scoreItem);
    });
}

/**
 * Show an error message to the user
 * @param {string} message - The error message to display
 */
export function showError(message) {
    // Create error element if it doesn't exist
    let errorElement = document.getElementById('error-message');
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = 'error-message';
        errorElement.style.position = 'fixed';
        errorElement.style.top = '20px';
        errorElement.style.left = '50%';
        errorElement.style.transform = 'translateX(-50%)';
        errorElement.style.backgroundColor = '#f44336';
        errorElement.style.color = 'white';
        errorElement.style.padding = '15px 20px';
        errorElement.style.borderRadius = '4px';
        errorElement.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        errorElement.style.zIndex = '1000';
        document.body.appendChild(errorElement);
    }
    
    // Set the message and show the error
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Hide after 5 seconds
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

// Export DOM elements for use in other modules
export const elements = {
    welcomeScreen,
    gameScreen,
    resultsScreen,
    playerNameInput,
    startGameButton,
    saveGameButton,
    quitGameButton,
    saveScoreButton,
    playAgainButton,
    returnHomeButton,
    nextQuestionButton
};
