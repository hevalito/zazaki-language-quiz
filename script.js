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

// Initialize the game
document.addEventListener('DOMContentLoaded', initGame);

function initGame() {
    // Embed questions and levels directly in the script
    const questionsData = {
        "questions": [
            {
                "id": 1,
                "type": "text",
                "question": "What is the Zazaki word for 'hello'?",
                "options": ["Merheba", "Silav", "Rojbaş", "Çıturi"],
                "correctAnswer": "Merheba",
                "difficulty": 1,
                "points": 10
            },
            {
                "id": 2,
                "type": "text",
                "question": "How do you say 'thank you' in Zazaki?",
                "options": ["Spas", "Teşekkür", "Sıpas", "Zaf weş"],
                "correctAnswer": "Zaf weş",
                "difficulty": 1,
                "points": 10
            },
            {
                "id": 3,
                "type": "text",
                "question": "What is the Zazaki word for 'bread'?",
                "options": ["Nan", "Goşt", "Av", "Sol"],
                "correctAnswer": "Nan",
                "difficulty": 1,
                "points": 15
            },
            {
                "id": 4,
                "type": "text",
                "question": "How do you say 'good morning' in Zazaki?",
                "options": ["Şev xeyr", "Roc xeyr", "Şıma senin", "Xatır ra"],
                "correctAnswer": "Roc xeyr",
                "difficulty": 2,
                "points": 20
            },
            {
                "id": 5,
                "type": "text",
                "question": "What is the Zazaki word for 'water'?",
                "options": ["Av", "Su", "Awe", "Çay"],
                "correctAnswer": "Awe",
                "difficulty": 1,
                "points": 10
            },
            {
                "id": 6,
                "type": "text",
                "question": "How do you say 'I love you' in Zazaki?",
                "options": ["Ez to ra hes kena", "Ez to vinena", "Ez şına", "To ra hes kena"],
                "correctAnswer": "Ez to ra hes kena",
                "difficulty": 2,
                "points": 15
            },
            {
                "id": 7,
                "type": "text",
                "question": "What is the Zazaki word for 'cat'?",
                "options": ["Kutık", "Pısınge", "Mar", "Heş"],
                "correctAnswer": "Pısınge",
                "difficulty": 1,
                "points": 15
            },
            {
                "id": 8,
                "type": "text",
                "question": "What is the Zazaki word for 'good'?",
                "options": ["Rınd", "Xirab", "Weş", "Gırs"],
                "correctAnswer": "Rınd",
                "difficulty": 1,
                "points": 10
            },
            {
                "id": 9,
                "type": "text",
                "question": "What is the Zazaki word for 'five'?",
                "options": ["Çar", "Panc", "Şeş", "Des"],
                "correctAnswer": "Panc",
                "difficulty": 2,
                "points": 20
            },
            {
                "id": 10,
                "type": "text",
                "question": "How do you say 'goodbye' in Zazaki?",
                "options": ["Oxır bo", "Şo weş", "Xatır ra", "Bımane weş"],
                "correctAnswer": "Xatır ra",
                "difficulty": 1,
                "points": 10
            }
        ],
        "levels": [
            {
                "level": 1,
                "requiredPoints": 0,
                "name": "Beginner"
            },
            {
                "level": 2,
                "requiredPoints": 50,
                "name": "Elementary"
            },
            {
                "level": 3,
                "requiredPoints": 100,
                "name": "Intermediate"
            },
            {
                "level": 4,
                "requiredPoints": 200,
                "name": "Advanced"
            },
            {
                "level": 5,
                "requiredPoints": 300,
                "name": "Fluent"
            }
        ]
    };
    
    // Set the game state with the embedded data
    gameState.questions = questionsData.questions;
    gameState.levels = questionsData.levels;
    
    // Initialize highscores with an empty array
    const highscoresData = { "highscores": [] };
    
    // Display highscores
    displayHighscores(highscoresData.highscores);
    
    // Load saved games
    loadSavedGames();
    
    // Set up event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Welcome Screen
    startGameButton.addEventListener('click', startNewGame);
    
    // Game Screen
    saveGameButton.addEventListener('click', saveGame);
    quitGameButton.addEventListener('click', quitGame);
    
    // Results Screen
    saveScoreButton.addEventListener('click', saveHighscore);
    playAgainButton.addEventListener('click', resetGame);
    returnHomeButton.addEventListener('click', returnToHome);
    
    // Feedback Modal
    nextQuestionButton.addEventListener('click', loadNextQuestion);
}

// Game Flow Functions
function startNewGame() {
    const playerName = playerNameInput.value.trim();
    
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
    updatePlayerInfo();
    
    // Show game screen
    showScreen(gameScreen);
    
    // Load first question
    loadQuestion();
}

function loadQuestion() {
    const question = gameState.questions[gameState.currentQuestionIndex];
    
    // Update question counter
    questionCounter.textContent = `Question: ${gameState.currentQuestionIndex + 1}/${gameState.questions.length}`;
    
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
    
    // Generate options
    generateOptions(question);
}

function generateOptions(question) {
    // Clear previous options
    optionsContainer.innerHTML = '';
    
    // Create and append option elements
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.textContent = option;
        optionElement.dataset.option = option;
        
        // Add click event listener
        optionElement.addEventListener('click', () => selectOption(optionElement, question));
        
        optionsContainer.appendChild(optionElement);
    });
}

function selectOption(optionElement, question) {
    const selectedOption = optionElement.dataset.option;
    const isCorrect = selectedOption === question.correctAnswer;
    
    // Highlight selected option
    const options = document.querySelectorAll('.option');
    options.forEach(opt => {
        opt.classList.remove('selected');
        
        // Disable further clicks
        opt.style.pointerEvents = 'none';
        
        // Highlight correct and incorrect answers
        if (opt.dataset.option === question.correctAnswer) {
            opt.classList.add('correct');
        } else if (opt.dataset.option === selectedOption && !isCorrect) {
            opt.classList.add('incorrect');
        }
    });
    
    // Update game state
    if (isCorrect) {
        gameState.player.score += question.points;
        gameState.player.correctAnswers++;
        updateLevel();
        
        // Show feedback
        showFeedback(true, 'Correct!', 'Well done! You got it right.');
    } else {
        // Show feedback
        showFeedback(false, 'Incorrect', `The correct answer was: ${question.correctAnswer}`);
    }
    
    // Update score display
    updatePlayerInfo();
}

function showFeedback(isCorrect, title, message) {
    feedbackTitle.textContent = title;
    feedbackMessage.textContent = message;
    feedbackTitle.style.color = isCorrect ? '#2ecc71' : '#e74c3c';
    
    feedbackModal.classList.remove('hidden');
}

function loadNextQuestion() {
    // Hide feedback modal
    feedbackModal.classList.add('hidden');
    
    // Move to next question or end game
    gameState.currentQuestionIndex++;
    
    if (gameState.currentQuestionIndex >= gameState.questions.length) {
        endGame();
    } else {
        loadQuestion();
    }
}

function endGame() {
    gameState.gameFinished = true;
    
    // Update results screen
    finalScore.textContent = `Your Score: ${gameState.player.score}`;
    finalLevel.textContent = `Your Level: ${gameState.player.level}`;
    correctAnswers.textContent = `Correct Answers: ${gameState.player.correctAnswers}/${gameState.questions.length}`;
    
    // Check if score qualifies for highscores
    const isHighscore = checkHighscore();
    highscoreEntry.style.display = isHighscore ? 'block' : 'none';
    
    // Show results screen
    showScreen(resultsScreen);
}

// Helper Functions
function shuffleQuestions() {
    // Fisher-Yates shuffle algorithm
    for (let i = gameState.questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameState.questions[i], gameState.questions[j]] = [gameState.questions[j], gameState.questions[i]];
    }
}

function updateLevel() {
    // Find the appropriate level based on score
    const newLevel = gameState.levels.find(level => 
        gameState.player.score >= level.requiredPoints
    );
    
    if (newLevel && newLevel.level > gameState.player.level) {
        gameState.player.level = newLevel.level;
    }
}

function updatePlayerInfo() {
    playerNameDisplay.textContent = `Player: ${gameState.player.name}`;
    levelDisplay.textContent = `Level: ${gameState.player.level}`;
    scoreDisplay.textContent = `Score: ${gameState.player.score}`;
}

function showScreen(screen) {
    // Hide all screens
    welcomeScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    resultsScreen.classList.add('hidden');
    
    // Show the requested screen
    screen.classList.remove('hidden');
}

// Save and Load Functions
function saveGame() {
    if (!gameState.gameStarted || gameState.gameFinished) {
        return;
    }
    
    const savedGames = getSavedGames();
    const timestamp = new Date().toISOString();
    
    // Create save data
    const saveData = {
        id: `save_${timestamp}`,
        player: gameState.player,
        currentQuestionIndex: gameState.currentQuestionIndex,
        timestamp: timestamp,
        displayName: `${gameState.player.name} - Level ${gameState.player.level} - Score ${gameState.player.score}`
    };
    
    // Add to saved games
    savedGames.push(saveData);
    
    // Save to localStorage
    localStorage.setItem('zazakiGameSaves', JSON.stringify(savedGames));
    
    alert('Game saved successfully!');
    
    // Refresh saved games list
    loadSavedGames();
}

function loadSavedGames() {
    const savedGames = getSavedGames();
    
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
        loadButton.addEventListener('click', () => loadGame(save.id));
        
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.style.backgroundColor = '#e74c3c';
        deleteButton.addEventListener('click', () => deleteSavedGame(save.id));
        
        saveItem.appendChild(saveInfo);
        saveItem.appendChild(loadButton);
        saveItem.appendChild(deleteButton);
        
        savedGamesList.appendChild(saveItem);
    });
}

function loadGame(saveId) {
    const savedGames = getSavedGames();
    const saveData = savedGames.find(save => save.id === saveId);
    
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
    updatePlayerInfo();
    
    // Show game screen
    showScreen(gameScreen);
    
    // Load current question
    loadQuestion();
}

function deleteSavedGame(saveId) {
    let savedGames = getSavedGames();
    
    // Filter out the game to delete
    savedGames = savedGames.filter(save => save.id !== saveId);
    
    // Save updated list
    localStorage.setItem('zazakiGameSaves', JSON.stringify(savedGames));
    
    // Refresh saved games list
    loadSavedGames();
}

function getSavedGames() {
    const savedGamesJson = localStorage.getItem('zazakiGameSaves');
    return savedGamesJson ? JSON.parse(savedGamesJson) : [];
}

// Highscore Functions
function loadHighscores() {
    // Use localStorage for highscores
    const localHighscores = getLocalHighscores();
    displayHighscores(localHighscores);
}

function displayHighscores(highscores) {
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

function saveHighscore() {
    const localHighscores = getLocalHighscores();
    
    // Create highscore entry
    const highscoreEntry = {
        name: gameState.player.name,
        score: gameState.player.score,
        level: gameState.player.level,
        date: new Date().toISOString()
    };
    
    // Add to local highscores
    localHighscores.push(highscoreEntry);
    
    // Sort and limit to top 20
    localHighscores.sort((a, b) => b.score - a.score);
    const topScores = localHighscores.slice(0, 20);
    
    // Save to localStorage
    localStorage.setItem('zazakiGameHighscores', JSON.stringify(topScores));
    
    // Try to save to server
    saveHighscoreToServer(highscoreEntry);
    
    // Hide highscore entry section
    document.getElementById('highscore-entry').style.display = 'none';
    
    // Refresh highscores display
    displayHighscores(topScores);
    
    alert('Your score has been saved!');
}

function saveHighscoreToServer(highscore) {
    // Just log the highscore for now
    console.log('Would save highscore to server:', highscore);
}

function getLocalHighscores() {
    const highscoresJson = localStorage.getItem('zazakiGameHighscores');
    return highscoresJson ? JSON.parse(highscoresJson) : [];
}

function checkHighscore() {
    const localHighscores = getLocalHighscores();
    
    // If less than 20 highscores, automatically qualifies
    if (localHighscores.length < 20) {
        return true;
    }
    
    // Sort highscores
    localHighscores.sort((a, b) => b.score - a.score);
    
    // Check if score is higher than the lowest highscore
    return gameState.player.score > localHighscores[localHighscores.length - 1].score;
}

// Game Control Functions
function quitGame() {
    if (confirm('Are you sure you want to quit? Your progress will be lost unless you save.')) {
        returnToHome();
    }
}

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
    updatePlayerInfo();
    
    // Show game screen
    showScreen(gameScreen);
    
    // Load first question
    loadQuestion();
}

function returnToHome() {
    // Show welcome screen
    showScreen(welcomeScreen);
    
    // Refresh saved games and highscores
    loadSavedGames();
    loadHighscores();
}
