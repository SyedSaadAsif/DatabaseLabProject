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
            res.json({ userId: -1 }); // Return -1 if credentials are invalid
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
    const { title, min_rating, max_rating, publisher_name, min_release_year, max_release_year, min_price, max_price } = req.query;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('title', sql.VarChar, title || null)
            .input('min_rating', sql.Int, min_rating || null)
            .input('max_rating', sql.Int, max_rating || null)
            .input('publisher_name', sql.VarChar, publisher_name || null)
            .input('min_release_year', sql.Int, min_release_year || null)
            .input('max_release_year', sql.Int, max_release_year || null)
            .input('min_price', sql.Decimal(10, 2), min_price || null)
            .input('max_price', sql.Decimal(10, 2), max_price || null)
            .execute('Search_Game');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error searching games:', err);
        res.status(500).json({ error: 'Failed to search games' });
    }
});
app.get('/api/getwallet', async (req, res) => {
    const { userId } = req.query; // Get the user ID from the query parameters

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' }); // Validate input
    }

    try {
        const pool = await poolPromise; // Get the database connection pool
        const result = await pool.request()
            .input('UserID', sql.Int, userId) // Pass the user ID as a parameter to the procedure
            .execute('GetWalletBalance'); // Execute the stored procedure

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'User not found' }); // Handle case where user is not found
        }
        // Return the wallet balance
        res.status(200).json({ walletBalance: result.recordset[0] });
    } catch (err) {
        console.error('Error fetching wallet balance:', err);
        res.status(500).json({ error: 'Failed to fetch wallet balance' }); // Handle server errors
    }
});
// Purchase API
app.post('/api/purchase', async (req, res) => {
    const { userID, gameIDs } = req.body;
    if (!userID || !gameIDs) {
        return res.status(400).json({ error: 'User ID and Game ID are required' });
    }
    try {
        const pool = await poolPromise;
        let statusMessages = [];
        for (const gameID of gameIDs) {
            const result = await pool.request()
                .input('userID', sql.Int, userID)
                .input('gameID', sql.Int, gameID)
                .output('statusMessage', sql.NVarChar(255)) // Capture the output message
                .execute('Purchase');
            statusMessages.push(result.output.statusMessage);
        }
        res.status(200).json({ messages: statusMessages });
    } catch (err) {
        console.error('Error during purchase:', err);
        res.status(500).json({ error: 'Failed to purchase game' });
    }
});
// Add to Cart API
app.post('/api/cart/add', async (req, res) => {
    const { userID, gameID } = req.body;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('UserID', sql.Int, userID)
            .input('GameID', sql.Int, gameID)
            .execute('AddToCart');

        // If no error, send success response
        res.status(200).json({ message: 'Game added to cart successfully' });
    } catch (err) {
        // Check if the error is due to the game already being in the cart
        if (err.message.includes('The game is already in the cart')) {
            res.status(400).json({ error: 'The game is already in the cart.' });
        } else {
            console.error('Error adding to cart:', err);
            res.status(500).json({ error: 'Failed to add to cart' });
        }
    }
});

// View Game Details API
app.get('/api/game/:gameID', async (req, res) => {
    const { gameID } = req.params;
    const { userID } = req.query; // Get UserID from query parameters

    if (!userID) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('GameID', sql.Int, gameID)
            .input('UserID', sql.Int, userID)
            .output('HasGame', sql.Bit) // Capture the output parameter
            .execute('ViewGameDetails');

        const gameDetails = result.recordset[0];
        const hasGame = result.output.HasGame;

        // Include Last_played and Purchase_date in the response if the user owns the game
        res.json({
            ...gameDetails,
            hasGame,
            lastPlayed: hasGame ? gameDetails.Last_played || null : null,
            purchaseDate: hasGame ? gameDetails.Purchase_date || null : null,
        });
    } catch (err) {
        console.error('Error fetching game details:', err);
        res.status(500).json({ error: 'Failed to fetch game details' });
    }
});

// Add Review API
app.post('/api/review', async (req, res) => {
    const { userID, gameID, comment } = req.body; // Removed commentDate
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('UserID', sql.Int, userID)
            .input('GameID', sql.Int, gameID)
            .input('Comment', sql.VarChar, comment) // Pass only the required parameters
            .execute('AddReview'); // Call the updated stored procedure
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
app.delete('/api/cart/delete', async (req, res) => {
    const { userID, gameID } = req.body;
    if (!userID || !gameID) {
        return res.status(400).json({ error: 'User ID and Game ID are required' });
    }
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
app.get('/api/cartview', async (req, res) => {
    const userId = req.query.userId; // Get userId from query parameters
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('UserID', sql.Int, userId) // Pass the userId to the stored procedure
            .execute('ViewCartContents'); // Call the stored procedure

        res.json(result.recordset); // Send the cart items as a response
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).json({ error: 'Failed to fetch cart items' });
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

// View User Profile API
app.get('/api/user/profile/:userID', async (req, res) => {
    const { userID } = req.params;

    try {
        const pool = await poolPromise; // Wait for the database connection pool
        const result = await pool.request()
            .input('User_ID', sql.Int, userID) // Pass the User_ID as input
            .execute('ViewUserProfile'); // Call the stored procedure

        // Check if the procedure returned a message or user profile details
        if (result.recordset.length === 1 && result.recordset[0].message) {
            // Return the message if the user is not found
            res.json({ message: result.recordset[0].message });
        } else {
            // Return the user's profile details
            res.json(result.recordset[0]);
        }
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});


// Remove Review
app.delete('/api/review', async (req, res) => {
  const { reviewID } = req.body; // Accept Review_ID from the request body

  if (!reviewID) {
    return res.status(400).json({ error: 'Review ID is required' });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Review_ID', sql.Int, reviewID) // Use Review_ID as input
      .execute('RemoveReview'); // Call the updated stored procedure

    const message = result.recordset.length > 0 ? result.recordset[0].message : 'Review deleted successfully';
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

app.get('/api/reviews/:gameID', async (req, res) => {
    const { gameID } = req.params;
    const { userID } = req.query; // Get userID from query parameters

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('GameID', sql.Int, gameID)
            .input('UserID', sql.Int, userID) // Pass userID to the procedure
            .execute('GetGameReviews'); // Call the updated procedure

        res.json(result.recordset); // Return the reviews
    } catch (err) {
        console.error('Error fetching reviews:', err);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// Toggle Like for a Review API
app.post('/api/review/like', async (req, res) => {
  const { userID, reviewID, like } = req.body; // `like` determines whether to like or unlike
  try {
    const pool = await poolPromise;
    if (like) {
      // Increment likes (like the review)
      await pool.request()
        .input('UserID', sql.Int, userID)
        .input('ReviewID', sql.Int, reviewID)
        .execute('LikeReview');
    } else {
      // Decrement likes (unlike the review)
      await pool.request()
        .input('UserID', sql.Int, userID)
        .input('ReviewID', sql.Int, reviewID)
        .execute('DislikeReview');
    }
    res.status(200).json({ message: 'Review like status updated successfully' });
  } catch (err) {
    console.error('Error toggling like status:', err);
    res.status(500).json({ error: 'Failed to toggle like status' });
  }
});

app.post('/api/game/play', async (req, res) => {
    const { userID, gameID } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('UserID', sql.Int, userID)
            .input('GameID', sql.Int, gameID)
            .execute('UpdateLastPlayed');
        res.status(200).json({ message: 'Last played date updated successfully' });
    } catch (err) {
        console.error('Error updating last played date:', err);
        res.status(500).json({ error: 'Failed to update last played date' });
    }
});

const PORT = 5000;


app.get('/', (req, res) => {
    res.send('Hello from Node.js Backend!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});