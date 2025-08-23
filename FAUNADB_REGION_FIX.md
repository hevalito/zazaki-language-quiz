# FaunaDB Region Issue Fix

## Root Cause Identified

After examining the FaunaDB dashboard, I've identified the likely cause of the "permission denied" errors:

**The database is located in the EU region, but the API key might be configured for a different region.**

FaunaDB has different regional endpoints:
- Global (default): `db.fauna.com`
- EU: `db.eu.fauna.com`
- US: `db.us.fauna.com`
- Classic: `db.fauna.com`

When you create a database in a specific region (in this case, EU), you need to make sure your client is configured to use the correct regional endpoint.

## Solution

Update the FaunaDB client initialization in all Netlify functions to specify the EU endpoint:

```javascript
// Initialize the FaunaDB client with the secret and correct endpoint
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET,
  domain: 'db.eu.fauna.com' // Specify EU region
});
```

This change needs to be made in the following files:
- `netlify/functions/getHighscores.js`
- `netlify/functions/saveHighscore.js`
- `netlify/functions/getQuestions.js`
- `netlify/functions/saveQuestion.js`
- `test-faunadb.js`

## Implementation Steps

1. Update each of the files mentioned above with the correct domain setting.
2. Deploy the changes to Netlify.
3. Test the connection using the updated test-faunadb.js script.

## Example Implementation

Here's how to update the client initialization in each file:

```javascript
// Before
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET
});

// After
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET,
  domain: 'db.eu.fauna.com' // Specify EU region
});
```

## Temporary Solution

Until the FaunaDB connection is fixed, the game will continue to use localStorage as a fallback, ensuring that users can still play the game and administrators can manage questions.

## Additional Notes

- The EU region for FaunaDB might have different latency characteristics compared to other regions.
- Make sure your Netlify functions have enough execution time to handle potential latency.
- Consider adding region-specific error handling to provide better diagnostics in the future.
