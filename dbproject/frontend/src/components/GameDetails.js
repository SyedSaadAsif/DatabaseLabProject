import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './GameDetails.css'; // Import the CSS file for styling

function GameDetails() {
  const { gameID } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const userId = localStorage.getItem('userId');
  const [showReviewField, setShowReviewField] = useState(false); // State to toggle the text field
  const [newReview, setNewReview] = useState(''); // State to store the new review text
  const [hasGame, setHasGame] = useState(false); // State to track if the user owns the game
  const [showNotification, setShowNotification] = useState(false); // Updated state

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/game/${gameID}?userID=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch game details');
        }
        const data = await response.json();
        setGame(data);
        setHasGame(data.hasGame); // Set the hasGame state
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
      const data = await response.json();
      if (response.ok) {
        setShowNotification({ message: 'Game added to cart successfully!', type: 'success' }); // Success notification
      } else {
        throw new Error(data.error || 'Failed to add game to cart');
      }
    } catch (err) {
      setShowNotification({ message: err.message || 'Failed to add game to cart', type: 'error' }); // Error notification
    } finally {
      // Automatically hide the notification after 3 seconds
      setTimeout(() => setShowNotification(false), 3000);
    }
};

  const handleBuyNow = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID: userId, gameIDs: [gameID] }),
      });
      const data = await response.json();
      if (response.ok) {
        setShowNotification({ message: data.messages.join('\n'), type: 'success' }); // Success notification
        // Refresh the page after a short delay
        if (data.messages == 'Purchase successful.')
          setTimeout(() => window.location.reload(), 3000);
      } else {
        throw new Error(data.error || 'Failed to purchase game');
      }
    } catch (err) {
      setShowNotification({ message: err.message || 'Failed to purchase game', type: 'error' }); // Error notification
    } finally {
      // Automatically hide the notification after 3 seconds
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  // Handle Play Game
  const handlePlayGame = async () => {
    setShowNotification({ message: `Launching ${game.Title}...`, type: 'success' }); // Success notification

    // Automatically hide the notification after 3 seconds
    setTimeout(() => setShowNotification(false), 3000);

    try {
        const response = await fetch('http://localhost:5000/api/game/play', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userID: userId, gameID }),
        });

        if (!response.ok) {
            throw new Error('Failed to update last played date');
        }
        setTimeout(() => window.location.reload(), 3000);
        console.log('Last played date updated successfully');
    } catch (err) {
        console.error('Error updating last played date:', err);
    }
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

  const handleAddReview = async () => {
    if (!newReview.trim()) {
      alert('Review cannot be empty!');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/review/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID: userId, gameID, comment: newReview }),
      });
      if (!response.ok) {
        throw new Error('Failed to add review');
      }
      alert('Review added successfully!');
      setNewReview(''); // Clear the text field
      setShowReviewField(false); // Hide the text field
      // Optionally, refresh the reviews list
      const updatedReviews = await response.json();
      setReviews((prevReviews) => [...prevReviews, updatedReviews]);
    } catch (err) {
      alert(err.message || 'Failed to add review');
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
      {/* Notification */}
      {showNotification && (
        <div
          className={`notification ${showNotification.type === 'success' ? 'success' : 'error'}`}
        >
          <p>{showNotification.message}</p>
        </div>
      )}

      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '10px',
          padding: '20px',
          display: 'flex',
          gap: '20px',
          position: 'relative',
        }}
      >
        {/* Game Poster */}
        <div style={{ flex: '0 0 30%', textAlign: 'center' }}>
          <img
            src={`/images/${game.Game_poster}`}
            alt={`${game.Title} Poster`}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '10px',
            }}
          />
        </div>

        {/* Title and Description */}
        <div style={{ flex: '1' , marginLeft: '20px'}}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: '15px',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  flex: '1',
                }}
              >
                <h1 style={{ margin: 0 }}>{game.Title}</h1>
                <h3>Description</h3>
                <p>{game.Description}</p>
              </div>
            </div>
            <div style={{ textAlign: 'right', marginTop: '-18px' }}>
              {/* Discount and Rating */}
              {!hasGame && game.discount > 0 && (
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
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: '15px',
                borderRadius: '10px',
                marginBottom: '20px',
                flex: '1',
              }}
            >
              <h3>Details</h3>
              <p>Publisher: {game.Publisher}</p>
              <p>Release Date: {new Date(game.release_date).toLocaleDateString()}</p>

              {hasGame ? (
                <>
                  <p>
                    Purchased Date: {game.purchaseDate ? new Date(game.purchaseDate).toLocaleDateString() : 'N/A'}
                  </p>
                  <p>
                    Last Played: {game.lastPlayed ? new Date(game.lastPlayed).toLocaleDateString() : 'N/A'}
                  </p>
                </>
              ) : (
                // Show price and discount if the user doesn't own the game
                <>
                  <p>Price: ${game.Price}</p>
                  {discountedPrice && <p>Discounted Price: ${discountedPrice}</p>}
                </>
              )}
            </div>
          </div>

          {/* Game Requirements */}
          <div>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: '15px',
                borderRadius: '10px',
                marginBottom: '20px',
                flex: '1',
              }}
            >
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
          </div>

          {/* Add to Cart and Buy Now Buttons */}
          {/* Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '20px',
          }}
        >
          {hasGame ? (
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
                Play Now
              </button>
            ) : (
              <>
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
              </>
            )}
        </div>
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
  {hasGame && (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    {showReviewField && (
      <input
        type="text"
        value={newReview}
        onChange={(e) => setNewReview(e.target.value)}
        placeholder="Write your review..."
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            console.log('Review:', newReview); // Log the review to the console
            setNewReview(''); // Clear the input field
            setShowReviewField(false); // Close the input field
          }
        }}
        style={{
          padding: '10px 10px',
          fontSize: '16px',
          borderRadius: '5px',
          border: '1px solid #ccc',
          outline: 'none',
          width: '500px',
        }}
      />
    )}
    <button
      onClick={() => {
        setShowReviewField((prev) => !prev); // Toggle the input field
      }}
      style={{
        padding: '5px 15px',
        fontSize: '26px',
        backgroundColor: showReviewField ? 'white' : 'blue', // Change color when input is open
        color: showReviewField ? 'blue' : 'white', // Change text color when input is open
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
      }}
      onMouseOver={(e) => {
        if (!showReviewField) {
          e.target.style.backgroundColor = 'white';
          e.target.style.color = 'blue';
        }
      }}
      onMouseOut={(e) => {
        if (!showReviewField) {
          e.target.style.backgroundColor = 'blue';
          e.target.style.color = 'white';
        }
      }}
    >
      +
    </button>
  </div>
  )}
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