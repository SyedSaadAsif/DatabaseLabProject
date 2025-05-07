import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

function GameDetails() {
  const { gameID } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const userId = localStorage.getItem('userId');

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

    const fetchReviews = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/reviews/${gameID}?userID=${userId}`);
        if (response.ok) {
            const data = await response.json();
            setReviews(data); // Set reviews with the `liked` status
        }
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      }
    };

    fetchGameDetails();
    fetchReviews();
  }, [gameID]);

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
      navigate('/library');
    } catch (err) {
      alert(err.message || 'Failed to purchase game');
    }
  };

  // Handle Play Game
  const handlePlayGame = () => {
    alert(`Launching ${game.Title}...`);
  };

  // Handle Like Review
  const handleToggleLikeReview = async (reviewID, isLiked) => {
    try {
      const response = await fetch(`http://localhost:5000/api/review/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID: userId, reviewID, like: !isLiked }), // Toggle the like status
      });
      if (!response.ok) {
        throw new Error('Failed to toggle like status');
      }
      const updatedReviews = reviews.map((review) =>
        review.Review_ID === reviewID
          ? {
              ...review,
              likes: isLiked ? review.likes - 1 : review.likes + 1, // Update like count
              liked: !isLiked, // Toggle liked status
            }
          : review
      );
      setReviews(updatedReviews);
    } catch (err) {
      console.error('Error toggling like status:', err);
    }
  };

  // Determine the context (Library, Store, or Cart)
  const getContext = () => {
    if (location.state?.from === 'library') return 'library';
    if (location.state?.from === 'cart') return 'cart';
    return 'store'; // Default to store
  };

  if (loading) return <div>Loading game details...</div>;
  if (error) return <div>Error: {error}</div>;

  const discountedPrice = game.discount > 0 ? (game.Price - (game.Price * game.discount) / 100).toFixed(2) : null;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: `url("/images/${game.Game_poster}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: 'white',
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '10px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          position: 'relative',
        }}
      >
        {/* Title and Description */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: 0 }}>{game.Title}</h1>
            <h3>Description</h3>
            <p>{game.Description}</p>
          </div>
          <div style={{ textAlign: 'right', marginTop: '-18px'}}>
            {/* Discount and Rating */}
            {game.discount > 0 && (
              <p
                style={{
                  backgroundColor: 'yellow',
                  color: 'black',
                  padding: '5px 10px',
                  borderRadius: '5px',
                  display: 'inline-block',
                  marginRight: '10px',
                }}
              >
                Discount: {game.discount}%
              </p>
            )}
            <p
              style={{
                backgroundColor: 'green',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '5px',
                display: 'inline-block',
              }}
            >
              Rating: {game.rating}/10
            </p>
          </div>
        </div>

        {/* Publisher and Other Details */}
        <div>
          <h3>Details</h3>
          <p>Publisher: {game.Publisher}</p>
          <p>Release Date: {new Date(game.release_date).toLocaleDateString()}</p>
          <p>Price: ${game.Price}</p>
          {discountedPrice && <p>Discounted Price: ${discountedPrice}</p>}
        </div>

        {/* Game Requirements */}
        <div>
          <h3>System Requirements</h3>
          <ul>
            <li>Processor: {game.Processor}</li>
            <li>GPU: {game.Gpu}</li>
            <li>RAM: {game.Ram}</li>
            <li>Storage: {game.Storage}</li>
            <li>OS: {game.OS}</li>
            <li>DirectX: {game.DXD3_version}</li>
          </ul>
        </div>

        {/* Buttons */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            display: 'flex',
            gap: '10px',
          }}
        >
          <button
            onClick={handleAddToCart}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: 'green',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.color = 'green';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'green';
              e.target.style.color = 'white';
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
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.color = 'orange';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'orange';
              e.target.style.color = 'white';
            }}
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* Reviews */}
      <div
        style={{
          marginTop: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '20px',
          borderRadius: '10px',
        }}
      >
        <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px',
    }}
  >
    <h3 style={{ fontSize: '1.8rem', margin: 0 }}>Reviews</h3>
    <button
      onClick={() => console.log('Add Review button clicked')} // Replace with your add review logic
      style={{
        padding: '5px 15px',
        fontSize: '26px',
        backgroundColor: 'blue',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
      }}
      onMouseOver={(e) => {
        e.target.style.backgroundColor = 'white';
        e.target.style.color = 'blue';
      }}
      onMouseOut={(e) => {
        e.target.style.backgroundColor = 'blue';
        e.target.style.color = 'white';
      }}
    >+
    </button>
  </div>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div
              key={review.Review_ID}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '10px',
                position: 'relative',
              }}
            >
              <p>
                <strong>{review.username}</strong>: {review.Comment}
              </p>
              {/* Like Button */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: review.liked ? 'pink' : 'transparent',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onClick={() => handleToggleLikeReview(review.Review_ID, review.liked)}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'pink';
                }}
                onMouseOut={(e) => {
                  if (!review.liked) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{review.likes}</span> {/* Like count */}
                  <span style={{ fontSize: '1.5rem' }}>👍</span> {/* Thumbs-up emoji */}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No reviews available.</p>
        )}
      </div>
    </div>
  );
}

export default GameDetails;