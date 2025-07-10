require('dotenv').config();
const { Client } = require('pg');

exports.handler = async function(event, context) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const res = await client.query('SELECT * FROM highways'); // Adjust table name if needed
    await client.end();
    return {
      statusCode: 200,
      body: JSON.stringify(res.rows),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `DB connection error: ${err.message}`,
    };
  }
}; 