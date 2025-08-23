const faunadb = require('faunadb');
const q = faunadb.query;

// Debug logging for environment variables
console.log('FAUNADB_SERVER_SECRET exists:', !!process.env.FAUNADB_SERVER_SECRET);
console.log('Function execution environment:', process.env.NODE_ENV || 'development');

// Initialize the FaunaDB client with the secret and correct EU region endpoint
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET,
  domain: 'db.eu.fauna.com' // Specify EU region
});

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    console.log('Attempting to query questions collection...');
    
    // Check if the questions collection exists
    let collectionExists = true;
    try {
      await client.query(q.Get(q.Collection('questions')));
      console.log('Questions collection exists');
    } catch (error) {
      if (error.name === 'NotFound') {
        collectionExists = false;
        console.log('Questions collection does not exist');
      } else {
        console.error('Error checking if questions collection exists:', error);
        throw error;
      }
    }

    // If the collection doesn't exist, create it and load default questions
    if (!collectionExists) {
      console.log('Creating questions collection...');
      
      // Create the collection
      await client.query(q.CreateCollection({ name: 'questions' }));
      console.log('Questions collection created successfully');
      
      // Load default questions
      const defaultQuestions = [
        {
          id: "q1",
          question: "What is 'bread' in Zazaki?",
          type: "text",
          options: ["Nan", "Ekmek", "Nan", "Brot"],
          correctAnswer: "Nan",
          difficulty: 1,
          points: 10
        },
        {
          id: "q2",
          question: "How do you say 'cat' in Zazaki?",
          type: "text",
          options: ["Pisik", "Kedi", "Gorbeh", "Katze"],
          correctAnswer: "Pisik",
          difficulty: 1,
          points: 10
        },
        {
          id: "q3",
          question: "What is 'good morning' in Zazaki?",
          type: "text",
          options: ["Şewe şıma xeyr", "Rocê şıma xeyr", "Şıma xeyr", "Xeyr"],
          correctAnswer: "Rocê şıma xeyr",
          difficulty: 1,
          points: 15
        },
        {
          id: "q4",
          question: "How do you count to five in Zazaki?",
          type: "text",
          options: ["Yew, dı, hirê, çar, panc", "Bir, iki, üç, dört, beş", "Yek, du, sê, çar, pênc", "Eins, zwei, drei, vier, fünf"],
          correctAnswer: "Yew, dı, hirê, çar, panc",
          difficulty: 2,
          points: 20
        },
        {
          id: "q5",
          question: "What is the Zazaki word for 'water'?",
          type: "text",
          options: ["Av", "Su", "Awe", "Çay"],
          correctAnswer: "Awe",
          difficulty: 1,
          points: 10
        },
        {
          id: "q6",
          question: "How do you say 'I love you' in Zazaki?",
          type: "text",
          options: ["Ez to ra hes kena", "Ez to vinena", "Ez şına", "To ra hes kena"],
          correctAnswer: "Ez to ra hes kena",
          difficulty: 2,
          points: 15
        },
        {
          id: "q7",
          question: "What is the Zazaki word for 'good'?",
          type: "text",
          options: ["Rınd", "Xirab", "Weş", "Gırs"],
          correctAnswer: "Rınd",
          difficulty: 1,
          points: 10
        },
        {
          id: "q8",
          question: "What is the Zazaki word for 'goodbye'?",
          type: "text",
          options: ["Oxır bo", "Şo weş", "Xatır ra", "Bımane weş"],
          correctAnswer: "Xatır ra",
          difficulty: 1,
          points: 10
        }
      ];
      
      console.log(`Loading ${defaultQuestions.length} default questions...`);
      
      // Create each question in the collection
      for (const question of defaultQuestions) {
        await client.query(
          q.Create(
            q.Collection('questions'),
            { data: question }
          )
        );
      }
      
      console.log('Default questions loaded successfully');
    }

    // Query all questions from the 'questions' collection
    console.log('Querying questions...');
    const response = await client.query(
      q.Map(
        q.Paginate(q.Documents(q.Collection('questions')), { size: 100 }),
        q.Lambda(
          'ref',
          q.Let(
            { doc: q.Get(q.Var('ref')) },
            q.Select(['data'], q.Var('doc'))
          )
        )
      )
    );

    console.log(`Retrieved ${response.data.length} questions`);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    // Enhanced error logging
    console.error('Detailed error in getQuestions:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      env: !!process.env.FAUNADB_SERVER_SECRET
    });
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Error retrieving questions',
        details: error.message
      })
    };
  }
};
