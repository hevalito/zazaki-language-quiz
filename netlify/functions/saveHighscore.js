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

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('Attempting to save highscore...');
    
    // Parse the request body
    const highscore = JSON.parse(event.body);
    
    // Validate the highscore data
    if (!highscore || !highscore.name || typeof highscore.score !== 'number') {
      console.log('Invalid highscore data:', highscore);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid highscore data' })
      };
    }
    
    console.log('Highscore data is valid:', highscore);
    
    // Check if the collection exists
    let collectionExists = true;
    try {
      await client.query(q.Get(q.Collection('highscores')));
      console.log('Highscores collection exists');
    } catch (error) {
      if (error.name === 'NotFound') {
        collectionExists = false;
        console.log('Highscores collection does not exist');
      } else {
        throw error;
      }
    }
    
    // If the collection doesn't exist, create it
    if (!collectionExists) {
      console.log('Creating highscores collection...');
      await client.query(q.CreateCollection({ name: 'highscores' }));
      console.log('Highscores collection created successfully');
    }
    
    // Create the highscore document
    console.log('Creating highscore document...');
    const result = await client.query(
      q.Create(
        q.Collection('highscores'),
        { data: highscore }
      )
    );
    
    console.log('Highscore saved successfully:', result);
    
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Highscore saved successfully',
        id: result.ref.id
      })
    };
  } catch (error) {
    // Enhanced error logging
    console.error('Detailed error in saveHighscore:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      env: !!process.env.FAUNADB_SERVER_SECRET
    });
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Error saving highscore',
        details: error.message
      })
    };
  }
};
