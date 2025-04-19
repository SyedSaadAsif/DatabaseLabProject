require('dotenv').config();
//require('dotenv').config({ path: __dirname + '/../.env' });

const sql = require('mssql');

console.log("ENV values:");
console.log("User:", process.env.DB_USER);
console.log("Password:", process.env.DB_PASSWORD);
console.log("Server:", process.env.DB_SERVER);
console.log("Database:", process.env.DB_NAME);

// Database configuration
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: 1433, 

  options: {
    encrypt: false, // Set to true if using Azure
    enableArithAbort: true,
    trustServerCertificate: true,
  },
};

console.log("DB Config:", dbConfig);

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL');
    return pool;
  })
  .catch(err => {
console.error('Database Connection Failed!', err.code, err.message, err);
  });


module.exports = { sql, poolPromise };


// sql.connect(dbConfig)
//   .then(pool => pool.request().query('SELECT 1 AS test'))
//   .then(result => console.log(result.recordset))
//   .catch(err => console.error('Connection error:', err));