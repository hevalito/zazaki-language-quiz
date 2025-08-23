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
    console.log('Attempting to query highscores collection...');
    
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
      
      // Return an empty array since there are no highscores yet
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([])
      };
    }

    // Query all highscores from the 'highscores' collection
    // Sort them by score in descending order and limit to top 20
    console.log('Querying highscores...');
    const response = await client.query(
      q.Map(
        q.Paginate(
          q.Documents(q.Collection('highscores')),
          { size: 20 }
        ),
        q.Lambda(
          'ref',
          q.Let(
            { doc: q.Get(q.Var('ref')) },
            {
              id: q.Select(['ref', 'id'], q.Var('doc')),
              name: q.Select(['data', 'name'], q.Var('doc')),
              score: q.Select(['data', 'score'], q.Var('doc')),
              level: q.Select(['data', 'level'], q.Var('doc')),
              date: q.Select(['data', 'date'], q.Var('doc'))
            }
          )
        )
      )
    );

    // Sort the highscores by score in descending order
    const highscores = response.data.sort((a, b) => b.score - a.score);
    console.log(`Retrieved ${highscores.length} highscores`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(highscores)
    };
  } catch (error) {
    // Enhanced error logging
    console.error('Detailed error in getHighscores:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      env: !!process.env.FAUNADB_SERVER_SECRET
    });
    
    // If the collection doesn't exist yet, return an empty array
    if (error.name === 'NotFound') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([])
      };
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Error retrieving highscores',
        details: error.message
      })
    };
  }
};
