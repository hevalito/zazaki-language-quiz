import { 
    defaultQuestions, 
    levelsData, 
    getQuestions, 
    saveQuestion as saveQuestionToFaunaDB, 
    updateQuestion as updateQuestionInFaunaDB, 
    deleteQuestion as deleteQuestionFromFaunaDB,
    gameConfig 
} from './data.js';

// DOM Elements
const adminLoginScreen = document.getElementById('admin-login-screen');
const adminDashboard = document.getElementById('admin-dashboard');
const loginErrorMessage = document.getElementById('login-error');

// Login Elements
const adminUsername = document.getElementById('admin-username');
const adminPassword = document.getElementById('admin-password');
const adminLoginButton = document.getElementById('admin-login-button');
const adminLogoutButton = document.getElementById('admin-logout-button');

// Tab Elements
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Questions Tab Elements
const questionsList = document.getElementById('questions-list');
const questionSearch = document.getElementById('question-search');
const questionFilter = document.getElementById('question-filter');
const addQuestionButton = document.getElementById('add-question-button');

// Levels Tab Elements
const levelsList = document.getElementById('levels-list');
const addLevelButton = document.getElementById('add-level-button');

// Settings Tab Elements
const adminUsernameChange = document.getElementById('admin-username-change');
const adminPasswordChange = document.getElementById('admin-password-change');
const saveSettingsButton = document.getElementById('save-settings-button');

// Question Editor Modal Elements
const questionEditorModal = document.getElementById('question-editor-modal');
const editorTitle = document.getElementById('editor-title');
const questionForm = document.getElementById('question-form');
const questionText = document.getElementById('question-text');
const questionType = document.getElementById('question-type');
const mediaUrlGroup = document.getElementById('media-url-group');
const mediaUrlLabel = document.getElementById('media-url-label');
const mediaUrl = document.getElementById('media-url');
const optionInputs = document.querySelectorAll('.option-text');
const correctOptions = document.querySelectorAll('.correct-option');
const questionDifficulty = document.getElementById('question-difficulty');
const questionPoints = document.getElementById('question-points');
const saveQuestionButton = document.getElementById('save-question-button');
const cancelQuestionButton = document.getElementById('cancel-question-button');

// Level Editor Modal Elements
const levelEditorModal = document.getElementById('level-editor-modal');
const levelEditorTitle = document.getElementById('level-editor-title');
const levelForm = document.getElementById('level-form');
const levelNumber = document.getElementById('level-number');
const levelName = document.getElementById('level-name');
const requiredPoints = document.getElementById('required-points');
const saveLevelButton = document.getElementById('save-level-button');
const cancelLevelButton = document.getElementById('cancel-level-button');

// Confirmation Modal Elements
const confirmationModal = document.getElementById('confirmation-modal');
const confirmationMessage = document.getElementById('confirmation-message');
const confirmDeleteButton = document.getElementById('confirm-delete-button');
const cancelDeleteButton = document.getElementById('cancel-delete-button');

// Default admin credentials (in a real app, these would be stored securely)
const DEFAULT_ADMIN = {
    username: 'admin',
    password: 'zazaki123'
};

// State variables
let questions = [];
let levels = [];
let currentEditingId = null;
let deleteCallback = null;

// Initialize the admin panel
document.addEventListener('DOMContentLoaded', initAdmin);

function initAdmin() {
    // Load data
    loadData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Check if already logged in
    checkLoginStatus();
}

async function loadData() {
    try {
        // Load questions from FaunaDB
        questions = await getQuestions();
        console.log(`Loaded ${questions.length} questions from FaunaDB`);
    } catch (error) {
        console.error('Error loading questions from FaunaDB:', error);
        
        // Fallback to localStorage
        const storedQuestions = localStorage.getItem('zazakiGameQuestions');
        questions = storedQuestions ? JSON.parse(storedQuestions) : [...defaultQuestions];
        console.log(`Loaded ${questions.length} questions from localStorage`);
    }
    
    // Load levels from localStorage or use default data
    const storedLevels = localStorage.getItem('zazakiGameLevels');
    levels = storedLevels ? JSON.parse(storedLevels) : [...levelsData];
    
    // Load admin credentials
    const storedAdmin = localStorage.getItem('zazakiGameAdmin');
    if (storedAdmin) {
        const adminData = JSON.parse(storedAdmin);
        // In a real app, you would validate this data more thoroughly
        if (adminData && adminData.username && adminData.password) {
            // Admin credentials are already stored
        }
    } else {
        // Store default admin credentials
        localStorage.setItem('zazakiGameAdmin', JSON.stringify(DEFAULT_ADMIN));
    }
}

function setupEventListeners() {
    // Login/Logout
    adminLoginButton.addEventListener('click', handleLogin);
    adminLogoutButton.addEventListener('click', handleLogout);
    
    // Tab Navigation
    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });
    
    // Questions Tab
    addQuestionButton.addEventListener('click', () => openQuestionEditor());
    questionSearch.addEventListener('input', filterQuestions);
    questionFilter.addEventListener('change', filterQuestions);
    
    // Levels Tab
    addLevelButton.addEventListener('click', () => openLevelEditor());
    
    // Settings Tab
    saveSettingsButton.addEventListener('click', saveSettings);
    
    // Question Editor
    questionType.addEventListener('change', updateMediaUrlField);
    questionForm.addEventListener('submit', saveQuestion);
    cancelQuestionButton.addEventListener('click', closeQuestionEditor);
    
    // Level Editor
    levelForm.addEventListener('submit', saveLevel);
    cancelLevelButton.addEventListener('click', closeLevelEditor);
    
    // Confirmation Modal
    confirmDeleteButton.addEventListener('click', confirmDelete);
    cancelDeleteButton.addEventListener('click', closeConfirmationModal);
}

// Authentication Functions
function handleLogin() {
    const username = adminUsername.value.trim();
    const password = adminPassword.value;
    
    if (!username || !password) {
        showLoginError('Please enter both username and password');
        return;
    }
    
    const storedAdmin = JSON.parse(localStorage.getItem('zazakiGameAdmin'));
    
    if (username === storedAdmin.username && password === storedAdmin.password) {
        // Login successful
        localStorage.setItem('zazakiGameLoggedIn', 'true');
        showDashboard();
        hideLoginError();
    } else {
        // Login failed
        showLoginError('Invalid username or password');
    }
}

function handleLogout() {
    localStorage.removeItem('zazakiGameLoggedIn');
    showLoginScreen();
}

function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('zazakiGameLoggedIn') === 'true';
    
    if (isLoggedIn) {
        showDashboard();
    } else {
        showLoginScreen();
    }
}

function showLoginScreen() {
    adminLoginScreen.classList.remove('hidden');
    adminDashboard.classList.add('hidden');
    
    // Clear login form
    adminUsername.value = '';
    adminPassword.value = '';
    hideLoginError();
}

function showDashboard() {
    adminLoginScreen.classList.add('hidden');
    adminDashboard.classList.remove('hidden');
    
    // Load dashboard data
    displayQuestions();
    displayLevels();
    
    // Load admin settings
    const storedAdmin = JSON.parse(localStorage.getItem('zazakiGameAdmin'));
    adminUsernameChange.value = storedAdmin.username;
    adminPasswordChange.value = '';
}

function showLoginError(message) {
    loginErrorMessage.textContent = message;
    loginErrorMessage.classList.remove('hidden');
}

function hideLoginError() {
    loginErrorMessage.classList.add('hidden');
}

// Tab Navigation
function switchTab(tabId) {
    // Update tab buttons
    tabButtons.forEach(button => {
        if (button.dataset.tab === tabId) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // Update tab content
    tabContents.forEach(content => {
        if (content.id === `${tabId}-tab`) {
            content.classList.remove('hidden');
        } else {
            content.classList.add('hidden');
        }
    });
}

// Questions Tab Functions
function displayQuestions() {
    // Clear the list
    questionsList.innerHTML = '';
    
    if (questions.length === 0) {
        questionsList.innerHTML = '<div class="empty-message">No questions found. Add your first question!</div>';
        return;
    }
    
    // Filter questions based on search and filter
    const searchTerm = questionSearch.value.toLowerCase();
    const filterType = questionFilter.value;
    
    const filteredQuestions = questions.filter(question => {
        const matchesSearch = question.question.toLowerCase().includes(searchTerm);
        const matchesFilter = filterType === 'all' || question.type === filterType;
        return matchesSearch && matchesFilter;
    });
    
    if (filteredQuestions.length === 0) {
        questionsList.innerHTML = '<div class="empty-message">No questions match your search criteria.</div>';
        return;
    }
    
    // Add each question to the list
    filteredQuestions.forEach(question => {
        const questionItem = document.createElement('div');
        questionItem.className = 'question-item';
        
        const questionInfo = document.createElement('div');
        questionInfo.className = 'question-info';
        
        const questionTextElement = document.createElement('div');
        questionTextElement.className = 'question-text';
        questionTextElement.textContent = question.question;
        
        const questionMeta = document.createElement('div');
        questionMeta.className = 'question-meta';
        questionMeta.textContent = `Type: ${question.type} | Difficulty: ${question.difficulty} | Points: ${question.points}`;
        
        questionInfo.appendChild(questionTextElement);
        questionInfo.appendChild(questionMeta);
        
        const questionActions = document.createElement('div');
        questionActions.className = 'question-actions';
        
        const editButton = document.createElement('button');
        editButton.className = 'edit-button';
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => openQuestionEditor(question));
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => openDeleteConfirmation(
            `Are you sure you want to delete the question: "${question.question}"?`,
            () => deleteQuestion(question.id)
        ));
        
        questionActions.appendChild(editButton);
        questionActions.appendChild(deleteButton);
        
        questionItem.appendChild(questionInfo);
        questionItem.appendChild(questionActions);
        
        questionsList.appendChild(questionItem);
    });
}

function filterQuestions() {
    displayQuestions();
}

function openQuestionEditor(question = null) {
    // Set editor mode (add or edit)
    if (question) {
        editorTitle.textContent = 'Edit Question';
        currentEditingId = question.id;
        
        // Fill form with question data
        questionText.value = question.question;
        questionType.value = question.type;
        
        // Handle media URL
        updateMediaUrlField();
        if (question.type === 'image' && question.imageUrl) {
            mediaUrl.value = question.imageUrl;
        } else if (question.type === 'audio' && question.audioUrl) {
            mediaUrl.value = question.audioUrl;
        }
        
        // Fill options
        question.options.forEach((option, index) => {
            if (index < optionInputs.length) {
                optionInputs[index].value = option;
            }
        });
        
        // Set correct answer
        const correctIndex = question.options.indexOf(question.correctAnswer);
        if (correctIndex >= 0 && correctIndex < correctOptions.length) {
            correctOptions[correctIndex].checked = true;
        }
        
        questionDifficulty.value = question.difficulty;
        questionPoints.value = question.points;
    } else {
        editorTitle.textContent = 'Add New Question';
        currentEditingId = null;
        
        // Reset form
        questionForm.reset();
        updateMediaUrlField();
    }
    
    // Show modal
    questionEditorModal.classList.remove('hidden');
}

function closeQuestionEditor() {
    questionEditorModal.classList.add('hidden');
    currentEditingId = null;
}

function updateMediaUrlField() {
    const type = questionType.value;
    
    if (type === 'text') {
        mediaUrlGroup.classList.add('hidden');
    } else {
        mediaUrlGroup.classList.remove('hidden');
        mediaUrlLabel.textContent = type === 'image' ? 'Image URL:' : 'Audio URL:';
    }
}

async function saveQuestion(event) {
    event.preventDefault();
    
    // Show loading state
    saveQuestionButton.textContent = 'Saving...';
    saveQuestionButton.disabled = true;
    
    try {
        // Get form values
        const text = questionText.value.trim();
        const type = questionType.value;
        
        // Get options
        const options = Array.from(optionInputs).map(input => input.value.trim());
        
        // Get correct answer
        const correctOptionIndex = Array.from(correctOptions).findIndex(option => option.checked);
        const correctAnswer = options[correctOptionIndex];
        
        // Get other values
        const difficulty = parseInt(questionDifficulty.value);
        const points = parseInt(questionPoints.value);
        
        // Create question object
        const question = {
            id: currentEditingId || `q${Date.now()}`, // Use existing ID or create new one
            type,
            question: text,
            options,
            correctAnswer,
            difficulty,
            points
        };
        
        // Add media URL if applicable
        if (type === 'image') {
            question.imageUrl = mediaUrl.value.trim();
        } else if (type === 'audio') {
            question.audioUrl = mediaUrl.value.trim();
        }
        
        try {
            // Try to add or update question in FaunaDB
            if (currentEditingId) {
                // Update existing question
                await updateQuestionInFaunaDB(question);
            } else {
                // Add new question
                await saveQuestionToFaunaDB(question);
            }
        } catch (faunaError) {
            console.error('Error saving to FaunaDB:', faunaError);
            console.log('Continuing with localStorage only');
        }
        
        // Always update local array and localStorage
        if (currentEditingId) {
            // Update existing question
            const index = questions.findIndex(q => q.id === currentEditingId);
            if (index !== -1) {
                questions[index] = question;
            }
        } else {
            // Add new question
            questions.push(question);
        }
        
        // Save to localStorage
        saveQuestions();
        
        // Update display
        displayQuestions();
        
        // Close editor
        closeQuestionEditor();
    } catch (error) {
        console.error('Error saving question:', error);
        alert(`Failed to save question: ${error.message}`);
    } finally {
        // Reset button state
        saveQuestionButton.textContent = 'Save Question';
        saveQuestionButton.disabled = false;
    }
}

async function deleteQuestion(id) {
    try {
        try {
            // Try to delete from FaunaDB
            await deleteQuestionFromFaunaDB(id);
        } catch (faunaError) {
            console.error('Error deleting from FaunaDB:', faunaError);
            console.log('Continuing with localStorage only');
        }
        
        // Always remove from local array
        questions = questions.filter(question => question.id !== id);
        
        // Save to localStorage
        saveQuestions();
        
        // Update display
        displayQuestions();
    } catch (error) {
        console.error('Error deleting question:', error);
        alert(`Failed to delete question: ${error.message}`);
    } finally {
        // Close confirmation modal
        closeConfirmationModal();
    }
}

function saveQuestions() {
    localStorage.setItem('zazakiGameQuestions', JSON.stringify(questions));
}

// Levels Tab Functions
function displayLevels() {
    // Clear the list
    levelsList.innerHTML = '';
    
    if (levels.length === 0) {
        levelsList.innerHTML = '<div class="empty-message">No levels found. Add your first level!</div>';
        return;
    }
    
    // Sort levels by level number
    const sortedLevels = [...levels].sort((a, b) => a.level - b.level);
    
    // Add each level to the list
    sortedLevels.forEach(level => {
        const levelItem = document.createElement('div');
        levelItem.className = 'level-item';
        
        const levelInfo = document.createElement('div');
        levelInfo.className = 'level-info';
        
        const levelTextElement = document.createElement('div');
        levelTextElement.className = 'question-text';
        levelTextElement.textContent = `Level ${level.level}: ${level.name}`;
        
        const levelMeta = document.createElement('div');
        levelMeta.className = 'level-meta';
        levelMeta.textContent = `Required Points: ${level.requiredPoints}`;
        
        levelInfo.appendChild(levelTextElement);
        levelInfo.appendChild(levelMeta);
        
        const levelActions = document.createElement('div');
        levelActions.className = 'level-actions';
        
        const editButton = document.createElement('button');
        editButton.className = 'edit-button';
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => openLevelEditor(level));
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => openDeleteConfirmation(
            `Are you sure you want to delete Level ${level.level}: ${level.name}?`,
            () => deleteLevel(level.level)
        ));
        
        levelActions.appendChild(editButton);
        levelActions.appendChild(deleteButton);
        
        levelItem.appendChild(levelInfo);
        levelItem.appendChild(levelActions);
        
        levelsList.appendChild(levelItem);
    });
}

function openLevelEditor(level = null) {
    // Set editor mode (add or edit)
    if (level) {
        levelEditorTitle.textContent = 'Edit Level';
        currentEditingId = level.level;
        
        // Fill form with level data
        levelNumber.value = level.level;
        levelName.value = level.name;
        requiredPoints.value = level.requiredPoints;
    } else {
        levelEditorTitle.textContent = 'Add New Level';
        currentEditingId = null;
        
        // Reset form
        levelForm.reset();
        
        // Set default level number to next available
        const maxLevel = levels.reduce((max, level) => Math.max(max, level.level), 0);
        levelNumber.value = maxLevel + 1;
    }
    
    // Show modal
    levelEditorModal.classList.remove('hidden');
}

function closeLevelEditor() {
    levelEditorModal.classList.add('hidden');
    currentEditingId = null;
}

function saveLevel(event) {
    event.preventDefault();
    
    // Get form values
    const number = parseInt(levelNumber.value);
    const name = levelName.value.trim();
    const points = parseInt(requiredPoints.value);
    
    // Create level object
    const level = {
        level: number,
        name,
        requiredPoints: points
    };
    
    // Add or update level
    if (currentEditingId) {
        // Update existing level
        const index = levels.findIndex(l => l.level === currentEditingId);
        if (index !== -1) {
            levels[index] = level;
        }
    } else {
        // Add new level
        levels.push(level);
    }
    
    // Save to localStorage
    saveLevels();
    
    // Update display
    displayLevels();
    
    // Close editor
    closeLevelEditor();
}

function deleteLevel(levelNumber) {
    // Remove level
    levels = levels.filter(level => level.level !== levelNumber);
    
    // Save to localStorage
    saveLevels();
    
    // Update display
    displayLevels();
    
    // Close confirmation modal
    closeConfirmationModal();
}

function saveLevels() {
    localStorage.setItem('zazakiGameLevels', JSON.stringify(levels));
}

// Settings Tab Functions
function saveSettings() {
    const username = adminUsernameChange.value.trim();
    const password = adminPasswordChange.value;
    
    if (!username) {
        alert('Username cannot be empty');
        return;
    }
    
    // Get current admin data
    const currentAdmin = JSON.parse(localStorage.getItem('zazakiGameAdmin'));
    
    // Update admin data
    const updatedAdmin = {
        username: username,
        password: password || currentAdmin.password // Keep old password if new one is empty
    };
    
    // Save to localStorage
    localStorage.setItem('zazakiGameAdmin', JSON.stringify(updatedAdmin));
    
    // Clear password field
    adminPasswordChange.value = '';
    
    alert('Settings saved successfully');
}

// Confirmation Modal Functions
function openDeleteConfirmation(message, callback) {
    confirmationMessage.textContent = message;
    deleteCallback = callback;
    confirmationModal.classList.remove('hidden');
}

function closeConfirmationModal() {
    confirmationModal.classList.add('hidden');
    deleteCallback = null;
}

function confirmDelete() {
    if (deleteCallback) {
        deleteCallback();
    }
}

// Export the questions and levels for use in the game
export async function getAdminQuestions() {
    try {
        return await getQuestions();
    } catch (error) {
        console.error('Error getting questions from FaunaDB:', error);
        return JSON.parse(localStorage.getItem('zazakiGameQuestions')) || defaultQuestions;
    }
}

export function getAdminLevels() {
    return JSON.parse(localStorage.getItem('zazakiGameLevels')) || levelsData;
}
