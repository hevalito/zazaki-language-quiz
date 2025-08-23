// Default game levels
export const levelsData = [
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
];

// Default questions in case the API fails
export const defaultQuestions = [
    {
        "id": "q1",
        "type": "text",
        "question": "What is the Zazaki word for 'hello'?",
        "options": ["Merheba", "Silav", "Rojbaş", "Çıturi"],
        "correctAnswer": "Merheba",
        "difficulty": 1,
        "points": 10
    },
    {
        "id": "q2",
        "type": "text",
        "question": "How do you say 'thank you' in Zazaki?",
        "options": ["Spas", "Teşekkür", "Sıpas", "Zaf weş"],
        "correctAnswer": "Zaf weş",
        "difficulty": 1,
        "points": 10
    },
    {
        "id": "q3",
        "type": "text",
        "question": "What is the Zazaki word for 'bread'?",
        "options": ["Nan", "Goşt", "Av", "Sol"],
        "correctAnswer": "Nan",
        "difficulty": 1,
        "points": 15
    },
    {
        "id": "q4",
        "type": "text",
        "question": "How do you say 'good morning' in Zazaki?",
        "options": ["Şev xeyr", "Roc xeyr", "Şıma senin", "Xatır ra"],
        "correctAnswer": "Roc xeyr",
        "difficulty": 2,
        "points": 20
    },
    {
        "id": "q5",
        "type": "text",
        "question": "What is the Zazaki word for 'water'?",
        "options": ["Av", "Su", "Awe", "Çay"],
        "correctAnswer": "Awe",
        "difficulty": 1,
        "points": 10
    }
];

// Flag to determine if we should use FaunaDB or localStorage
const USE_FAUNADB = true; // Set to true to use FaunaDB with EU region endpoint

// Get questions from FaunaDB via Netlify function or localStorage
export async function getQuestions() {
    if (USE_FAUNADB) {
        console.log('🔍 Fetching questions from FaunaDB...');
        try {
            const response = await fetch('/.netlify/functions/getQuestions');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const questions = await response.json();
            console.log(`✅ Successfully retrieved ${questions.length} questions from FaunaDB`);
            
            // Save to localStorage as a cache
            localStorage.setItem('zazakiGameQuestions', JSON.stringify(questions));
            
            return questions;
        } catch (error) {
            console.error('❌ Error loading questions from FaunaDB:', error);
            
            // Try to get questions from localStorage as a fallback
            try {
                const storedQuestions = localStorage.getItem('zazakiGameQuestions');
                if (storedQuestions) {
                    const parsedQuestions = JSON.parse(storedQuestions);
                    console.log(`📋 Retrieved ${parsedQuestions.length} questions from localStorage`);
                    return parsedQuestions;
                }
            } catch (localError) {
                console.error('❌ Error loading questions from localStorage:', localError);
            }
            
            // Return default questions as a last resort
            console.log('⚠️ Using default questions');
            return defaultQuestions;
        }
    } else {
        console.log('📋 Using localStorage for questions (FaunaDB disabled)');
        
        // Try to get questions from localStorage
        try {
            const storedQuestions = localStorage.getItem('zazakiGameQuestions');
            if (storedQuestions) {
                const parsedQuestions = JSON.parse(storedQuestions);
                console.log(`📋 Retrieved ${parsedQuestions.length} questions from localStorage`);
                return parsedQuestions;
            }
        } catch (localError) {
            console.error('❌ Error loading questions from localStorage:', localError);
        }
        
        // If no questions in localStorage, use default questions and save them
        console.log('⚠️ No questions in localStorage, using default questions');
        localStorage.setItem('zazakiGameQuestions', JSON.stringify(defaultQuestions));
        return defaultQuestions;
    }
}

// Get levels from localStorage or use defaults
export function getLevels() {
    try {
        const storedLevels = localStorage.getItem('zazakiGameLevels');
        if (storedLevels) {
            return JSON.parse(storedLevels);
        }
    } catch (error) {
        console.error('Error loading levels from localStorage:', error);
    }
    return levelsData;
}

// Save a question to FaunaDB
export async function saveQuestion(question) {
    console.log('🔍 Saving question to FaunaDB:', question);
    
    try {
        const response = await fetch('/.netlify/functions/saveQuestion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(question)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error response body:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Successfully saved question to FaunaDB:', result);
        return result;
    } catch (error) {
        console.error('❌ Error saving question to FaunaDB:', error);
        throw error;
    }
}

// Update a question in FaunaDB
export async function updateQuestion(question) {
    console.log('🔍 Updating question in FaunaDB:', question);
    
    try {
        const response = await fetch('/.netlify/functions/saveQuestion', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(question)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error response body:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Successfully updated question in FaunaDB:', result);
        return result;
    } catch (error) {
        console.error('❌ Error updating question in FaunaDB:', error);
        throw error;
    }
}

// Delete a question from FaunaDB
export async function deleteQuestion(questionId) {
    console.log('🔍 Deleting question from FaunaDB:', questionId);
    
    try {
        const response = await fetch(`/.netlify/functions/saveQuestion/${questionId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error response body:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Successfully deleted question from FaunaDB:', result);
        return result;
    } catch (error) {
        console.error('❌ Error deleting question from FaunaDB:', error);
        throw error;
    }
}

// Future versions can add more questions and categories
export const gameConfig = {
    maxQuestions: 10,
    saveGamePrefix: 'zazakiGameSaves',
    highscorePrefix: 'zazakiGameHighscores',
    maxHighscores: 20
};
