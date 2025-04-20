require('dotenv').config(); 


const express = require('express');
const cors = require('cors');
const { poolPromise } = require('./config/db'); // Import poolPromise
console.log('poolPromise:', poolPromise); // Add this line
const taskRoutes = require('./routes/taskRoutes');
const app = express();
app.use(express.json()); 
app.use(cors());
app.use('/api', taskRoutes);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  });
  
  app.get('/api/games', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Game_Catalogue');
        res.json(result.recordset); // Return the list of games
    } catch (err) {
        console.error('Error fetching games:', err);
        res.status(500).json({ error: 'Failed to fetch games' });
    }
});


const PORT = 5000;


app.get('/', (req, res) => {
    res.send('Hello from Node.js Backend!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});