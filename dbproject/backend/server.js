require('dotenv').config(); 


const express = require('express');
const cors = require('cors');
const sql = require('mssql');
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

// Signup API
app.post('/api/signup', async (req, res) => {
    const { username, password, email, date_of_birth } = req.body;
    // Debugging: Log incoming request body
    console.log("Signup Request Body:", req.body);

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('username', username)
            .input('password', password)
            .input('email', email)
            .input('date_of_birth', date_of_birth)
            .execute('Signup');
        
        res.status(201).json({ message: 'User signed up successfully' });
    } catch (err) {
        console.log(username, password, email, date_of_birth);
        console.error('Error during signup:', err);
        res.status(500).json({ error: 'Failed to sign up' });
    }
});
// Login API
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('username', username)
            .input('password', password)
            .execute('Login');
        if (result.recordset.length > 0) {
            res.json({ userId: result.recordset[0].User_ID });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'Failed to log in' });
    }
});

// Library View API
app.get('/api/library/:userID', async (req, res) => {
    const { userID } = req.params;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userID', userID)
            .execute('Library_view');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching library:', err);
        res.status(500).json({ error: 'Failed to fetch library' });
    }
});

// Search Game API
app.get('/api/search', async (req, res) => {
    const { rating, publisher_id, price } = req.query;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('rating', rating || null)
            .input('publisher_id', publisher_id || null)
            .input('price', price || null)
            .execute('Search_Game');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error searching games:', err);
        res.status(500).json({ error: 'Failed to search games' });
    }
});

// Purchase API
app.post('/api/purchase', async (req, res) => {
    const { userID, gameID } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('userID', userID)
            .input('gameID', gameID)
            .execute('Purchase');
        res.status(200).json({ message: 'Game purchased successfully' });
    } catch (err) {
        console.error('Error during purchase:', err);
        res.status(500).json({ error: 'Failed to purchase game' });
    }
});

// Add to Cart API
app.post('/api/cart', async (req, res) => {
    const { userID, gameID } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('UserID', userID)
            .input('GameID', gameID)
            .execute('AddToCart');
        res.status(200).json({ message: 'Game added to cart successfully' });
    } catch (err) {
        console.error('Error adding to cart:', err);
        res.status(500).json({ error: 'Failed to add to cart' });
    }
});

// View Game Details API
app.get('/api/game/:gameID', async (req, res) => {
    const { gameID } = req.params;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('GameID', gameID)
            .execute('ViewGameDetails');
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error fetching game details:', err);
        res.status(500).json({ error: 'Failed to fetch game details' });
    }
});

// Add Review API
app.post('/api/review', async (req, res) => {
    const { userID, gameID, comment, commentDate } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('UserID', userID)
            .input('GameID', gameID)
            .input('Comment', comment)
            .input('CommentDate', commentDate)
            .execute('AddReview');
        res.status(201).json({ message: 'Review added successfully' });
    } catch (err) {
        console.error('Error adding review:', err);
        res.status(500).json({ error: 'Failed to add review' });
    }
});

// Update User Profile
app.put('/api/user/profile', async (req, res) => {
    const { userID, newUsername, newEmail, newPassword, newProfileImage } = req.body;

    try {
        const pool = await poolPromise; // Wait for the database connection pool
        const result = await pool.request()
            .input('User_ID', sql.Int, userID)
            .input('NewUsername', sql.VarChar, newUsername || null)
            .input('NewEmail', sql.VarChar, newEmail || null)
            .input('NewPassword', sql.VarChar, newPassword || null)
            .input('NewProfileImage', sql.VarChar, newProfileImage || null)
            .execute('UpdateUserProfile'); // Call the stored procedure

        res.json({ message: 'User profile updated successfully' });
    } catch (err) {
        console.error('Error updating user profile:', err);
        res.status(500).json({ error: 'Failed to update user profile' });
    }
});

// Add Funds to Wallet
app.post('/api/user/wallet', async (req, res) => {
    const { userID, amount } = req.body;

    try {
        const pool = await poolPromise; 
        const result = await pool.request()
            .input('UserID', sql.Int, userID)
            .input('Amount', sql.Int, amount)
            .execute('AddFundsToWallet');  
        res.json({ message: 'Funds added to wallet successfully' });
    } catch (err) {
        console.error('Error adding funds to wallet:', err);
        res.status(500).json({ error: 'Failed to add funds to wallet' });
    }
});

// Remove Game from Cart
app.delete('/api/cart', async (req, res) => {
    const { userID, gameID } = req.body;

    try {
        const pool = await poolPromise; 
        const result = await pool.request()
            .input('User_ID', sql.Int, userID)
            .input('Game_ID', sql.Int, gameID)
            .execute('RemoveGameFromCart'); 

        const message = result.recordset.length > 0 ? result.recordset[0].message : 'No message returned';

        res.json({ message }); 
    } catch (err) {
        console.error('Error removing game from cart:', err);
        res.status(500).json({ error: 'Failed to remove game from cart' });
    }
});
             
// View User's Purchase History
app.get('/api/user/purchase-history/:userID', async (req, res) => {
    const { userID } = req.params;

    try {
        const pool = await poolPromise; 
        const result = await pool.request()
            .input('User_ID', sql.Int, userID)
            .execute('ViewPurchaseHistory');

        // If purchase history is empty
        if (result.recordset.length === 0) {
            res.json({ message: 'No purchase history found for this user.' });
        } else {
            res.json(result.recordset); // Return the actual purchase history details
        }
    } catch (err) {
        console.error('Error fetching purchase history:', err);
        res.status(500).json({ error: 'Failed to fetch purchase history' });
    }
});

// Remove Review
app.delete('/api/review', async (req, res) => {
    const { userID, gameID } = req.body;

    try {
        const pool = await poolPromise; 
        const result = await pool.request()
            .input('User_ID', sql.Int, userID)
            .input('Game_ID', sql.Int, gameID)
            .execute('RemoveReview');

        
        const message = result.recordset.length > 0 ? result.recordset[0].message : 'No message returned';

        res.json({ message });
    } catch (err) {
        console.error('Error removing review:', err);
        res.status(500).json({ error: 'Failed to remove review' });
    }
});

// Fetch All Games from View_All_Games
app.get('/api/games/all', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM View_All_Games'); 
        res.json(result.recordset); 
    } catch (err) {
        console.error('Error fetching all games:', err);
        res.status(500).json({ error: 'Failed to fetch all games' });
    }
});



const PORT = 5000;


app.get('/', (req, res) => {
    res.send('Hello from Node.js Backend!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});