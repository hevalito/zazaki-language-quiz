const faunadb = require('faunadb');
const q = faunadb.query;

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
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST, PUT, and DELETE requests
  if (!['POST', 'PUT', 'DELETE'].includes(event.httpMethod)) {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Check if the questions collection exists, create it if it doesn't
    try {
      await client.query(q.Get(q.Collection('questions')));
    } catch (error) {
      if (error.name === 'NotFound') {
        // Create the collection
        await client.query(q.CreateCollection({ name: 'questions' }));
        console.log('Created questions collection');
      } else {
        throw error;
      }
    }

    // Handle different HTTP methods
    if (event.httpMethod === 'DELETE') {
      // Delete a question
      const questionId = event.path.split('/').pop();
      
      if (!questionId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Question ID is required for DELETE' })
        };
      }
      
      // Find the document reference by the question ID
      const result = await client.query(
        q.Map(
          q.Paginate(
            q.Match(q.Index('question_by_id'), questionId)
          ),
          q.Lambda('ref', q.Get(q.Var('ref')))
        )
      );
      
      if (result.data.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Question not found' })
        };
      }
      
      // Delete the document
      await client.query(
        q.Delete(result.data[0].ref)
      );
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          message: 'Question deleted successfully'
        })
      };
    } else {
      // Parse the request body for POST and PUT
      const question = JSON.parse(event.body);
      
      // Validate the question data
      if (!question || !question.question || !question.options || !question.correctAnswer) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid question data' })
        };
      }
      
      // Ensure the question has an ID
      if (!question.id) {
        question.id = `q${Date.now()}`;
      }
      
      if (event.httpMethod === 'PUT') {
        // Update an existing question
        // Find the document reference by the question ID
        const result = await client.query(
          q.Map(
            q.Paginate(
              q.Match(q.Index('question_by_id'), question.id)
            ),
            q.Lambda('ref', q.Get(q.Var('ref')))
          )
        );
        
        if (result.data.length === 0) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Question not found' })
          };
        }
        
        // Update the document
        const updateResult = await client.query(
          q.Update(
            result.data[0].ref,
            { data: question }
          )
        );
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'Question updated successfully',
            question: updateResult.data
          })
        };
      } else {
        // Create a new question (POST)
        // Check if an index for question_by_id exists, create it if it doesn't
        try {
          await client.query(q.Get(q.Index('question_by_id')));
        } catch (error) {
          if (error.name === 'NotFound') {
            // Create the index
            await client.query(
              q.CreateIndex({
                name: 'question_by_id',
                source: q.Collection('questions'),
                terms: [{ field: ['data', 'id'] }],
                unique: true
              })
            );
            console.log('Created question_by_id index');
          } else {
            throw error;
          }
        }
        
        // Create the question
        const result = await client.query(
          q.Create(
            q.Collection('questions'),
            { data: question }
          )
        );
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'Question created successfully',
            question: result.data,
            id: result.ref.id
          })
        };
      }
    }
  } catch (error) {
    console.error('Error saving question:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Error saving question',
        details: error.message
      })
    };
  }
};
