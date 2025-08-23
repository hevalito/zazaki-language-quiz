#!/usr/bin/env node

/**
 * FaunaDB Connection Test Script
 * 
 * This script tests the connection to FaunaDB and verifies that the
 * highscores collection exists and can be accessed.
 * 
 * Usage:
 * 1. Make sure you have the FaunaDB server secret set as an environment variable:
 *    export FAUNADB_SERVER_SECRET=your-fauna-secret-key
 * 
 * 2. Run the script:
 *    node test-faunadb.js
 */

const faunadb = require('faunadb');
const q = faunadb.query;

// Check if the environment variable is set
if (!process.env.FAUNADB_SERVER_SECRET) {
  console.error('Error: FAUNADB_SERVER_SECRET environment variable is not set.');
  console.error('Please set it with: export FAUNADB_SERVER_SECRET=your-fauna-secret-key');
  process.exit(1);
}

// Initialize the FaunaDB client with the secret and correct EU region endpoint
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET,
  domain: 'db.eu.fauna.com' // Specify EU region
});

// Test function to check the connection and collection
async function testFaunaDB() {
  console.log('Testing FaunaDB connection...');
  console.log('Using secret key:', process.env.FAUNADB_SERVER_SECRET.substring(0, 5) + '...');
  
  try {
    // Test basic connection with a simpler query that doesn't require admin privileges
    console.log('Attempting to create a test collection...');
    
    // Try to create a test collection
    try {
      await client.query(q.CreateCollection({ name: 'test_connection' }));
      console.log('✅ Successfully created test collection!');
      
      // Clean up by deleting the test collection
      await client.query(q.Delete(q.Collection('test_connection')));
      console.log('✅ Successfully deleted test collection!');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Test collection already exists, connection successful!');
      } else if (error.message.includes('permission denied')) {
        console.error('❌ Permission denied. Your key may not have the right permissions.');
        console.log('\nTry creating a new key with the following settings:');
        console.log('1. Go to your FaunaDB dashboard');
        console.log('2. Go to Security > Keys');
        console.log('3. Click "New Key"');
        console.log('4. Set Role to "Server"');
        console.log('5. Select your database');
        console.log('6. Click "Save" and copy the new key');
        return;
      } else {
        throw error;
      }
    }
    
    console.log('\nTesting highscores collection...');
    
    try {
      // Test if the highscores collection exists
      await client.query(q.Exists(q.Collection('highscores')));
      console.log('✅ Highscores collection exists!');
    } catch (error) {
      if (error.name === 'NotFound' || error.message.includes('Collection not found')) {
        console.log('❌ Highscores collection does not exist.');
        console.log('\nTrying to create the collection...');
        
        try {
          await client.query(q.CreateCollection({ name: 'highscores' }));
          console.log('✅ Successfully created the highscores collection!');
        } catch (createError) {
          console.error('❌ Failed to create the collection:', createError.message);
          return;
        }
      } else {
        console.error('❌ Error testing collection:', error.message);
        return;
      }
    }
    
    // Try to add a test highscore
    console.log('\nTrying to add a test highscore...');
    const testHighscore = {
      name: 'Test User',
      score: 999,
      level: 1,
      date: new Date().toISOString()
    };
    
    try {
      const result = await client.query(
        q.Create(
          q.Collection('highscores'),
          { data: testHighscore }
        )
      );
      
      console.log('✅ Successfully added a test highscore!');
      console.log('Test highscore ID:', result.ref.id);
    } catch (error) {
      console.error('❌ Failed to add test highscore:', error.message);
      return;
    }
    
    // Try to retrieve highscores
    console.log('\nTrying to retrieve highscores...');
    try {
      const highscores = await client.query(
        q.Map(
          q.Paginate(q.Documents(q.Collection('highscores')), { size: 5 }),
          q.Lambda('ref', q.Get(q.Var('ref')))
        )
      );
      
      console.log('✅ Successfully retrieved highscores!');
      console.log('Number of highscores:', highscores.data.length);
      if (highscores.data.length > 0) {
        console.log('Sample highscore:', JSON.stringify(highscores.data[0].data, null, 2));
      }
    } catch (error) {
      console.error('❌ Failed to retrieve highscores:', error.message);
      return;
    }
    
    console.log('\n🎉 All tests passed! Your FaunaDB setup is working correctly.');
    
  } catch (error) {
    console.error('❌ Failed to connect to FaunaDB:', error.message);
    console.error('\nPossible issues:');
    console.error('1. The FAUNADB_SERVER_SECRET is incorrect');
    console.error('2. The FaunaDB server is not accessible');
    console.error('3. Your account or database has issues');
    
    console.log('\nTry creating a new key with the following settings:');
    console.log('1. Go to your FaunaDB dashboard');
    console.log('2. Go to Security > Keys');
    console.log('3. Click "New Key"');
    console.log('4. Set Role to "Server"');
    console.log('5. Select your database');
    console.log('6. Click "Save" and copy the new key');
  }
}

// Run the test
testFaunaDB().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
