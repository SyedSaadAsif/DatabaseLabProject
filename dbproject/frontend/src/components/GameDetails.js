import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

function GameDetails() {
  const { gameID } = useParams(); // Get the gameID from the URL
  const navigate = useNavigate();
  const location = useLocation(); // Get the current location to determine the context
  const [game, setGame] = useState(null); // State to store game details
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const userId = localStorage.getItem('userId'); // Get the logged-in user's ID

  // Fetch game details from the API
  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/game/${gameID}`);
        if (!response.ok) {
          throw new Error('Failed to fetch game details');
        }
        const data = await response.json();
        setGame(data);
      } catch (err) {
        setError(err.message || 'Failed to load game details');
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [gameID]);

  // Handle Add to Cart
  const handleAddToCart = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID: userId, gameID }),
      });
      if (!response.ok) {
        throw new Error('Failed to add game to cart');
      }
      alert('Game added to cart successfully!');
    } catch (err) {
      alert(err.message || 'Failed to add game to cart');
    }
  };

  // Handle Buy Now
  const handleBuyNow = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID: userId, gameID }),
      });
      if (!response.ok) {
        throw new Error('Failed to purchase game');
      }
      alert('Game purchased successfully!');
      navigate('/library'); // Redirect to the library after purchase
    } catch (err) {
      alert(err.message || 'Failed to purchase game');
    }
  };

  // Handle Play Game
  const handlePlayGame = () => {
    alert(`Launching ${game.Title}...`);
  };

  // Determine the context (Library, Store, or Cart)
  const getContext = () => {
    if (location.state?.from === 'library') return 'library';
    if (location.state?.from === 'cart') return 'cart';
    return 'store'; // Default to store
  };

  if (loading) return <div>Loading game details...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: 'url("/background.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: 'white',
        padding: '20px',
      }}
    >
      <h1>{game.Title}</h1>
      <img
        src={`/images/${game.Game_poster}`}
        alt={game.Title}
        style={{ width: '300px', height: '400px', objectFit: 'cover', borderRadius: '10px' }}
      />
      <p>{game.Description}</p>
      <p>Price: ${game.Price}</p>
      <p>Rating: {game.rating}/10</p>
      <p>Release Date: {new Date(game.release_date).toLocaleDateString()}</p>
      <p>Discount: {game.discount}%</p>

      {/* Render buttons based on context */}
      <div style={{ marginTop: '20px' }}>
        {getContext() === 'library' && (
          <button
            onClick={handlePlayGame}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: 'green',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Play
          </button>
        )}
        {getContext() === 'store' && (
          <>
            <button
              onClick={handleAddToCart}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: 'blue',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginRight: '10px',
              }}
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: 'orange',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Buy Now
            </button>
          </>
        )}
        {getContext() === 'cart' && (
          <button
            onClick={handleBuyNow}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: 'orange',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Buy Now
          </button>
        )}
      </div>
    </div>
  );
}

export default GameDetails;