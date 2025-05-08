import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import GameDetails from './components/GameDetails'; // Import the GameDetails component
import '@fortawesome/fontawesome-free/css/all.min.css';

function Homepage() {
  const [games, setGames] = useState([]);
  const navigate = useNavigate();
  const [showSearchBar, setShowSearchBar] = useState(false); // State to toggle search bar visibility
  const [searchQuery, setSearchQuery] = useState(''); // State to store the search input
  const [sortOption, setSortOption] = useState({ type: '', order: 'asc' }); // Sorting state
  const [showFilterOverlay, setShowFilterOverlay] = useState(false); // State to toggle filter overlay
  const [filterData, setFilterData] = useState({
    title: '',
    min_rating: '',
    max_rating: '',
    publisher_name: '',
    min_release_year: '',
    max_release_year: '',
    min_price: '',
    max_price: '',
  });

  // Fetch games from the API
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/games');
        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }
        const data = await response.json();
        setGames(data);
      } catch (error) {
        console.error('Error fetching games:', error);
      }
    };

    fetchGames();
  }, []);

  // Handle filter apply
  const handleApplyFilter = async () => {
    try {
      const queryParams = new URLSearchParams(filterData).toString();
      const response = await fetch(`http://localhost:5000/api/search?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch filtered games');
      }
      const data = await response.json();
      setGames(data); // Update games with filtered data
      setShowFilterOverlay(false); // Close the overlay
    } catch (error) {
      console.error('Error applying filter:', error);
    }
  };

  // Handle filter input change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('userId'); // Clear user ID from local storage
    navigate('/'); // Redirect to login page
  };

  // Button styles with hover effect
  const buttonStyle = (bgColor, textColor) => ({
    padding: '10px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: bgColor,
    color: textColor,
    border: 'none',
    borderRadius: '5px',
    transition: 'all 0.3s ease',
  });

  const buttonHoverStyle = (bgColor, textColor) => ({
    ':hover': {
      backgroundColor: textColor,
      color: bgColor,
    },
  });

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    try {
      filterData.title = searchQuery; // Set the title filter to the search query
      const queryParams = new URLSearchParams(filterData).toString();
      const response = await fetch(`http://localhost:5000/api/search?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch searched games');
      }
      const data = await response.json();
      setGames(data); // Update games with searched data
    } catch (error) {
      console.error('Error applying search:', error);
    }
  };

  // Sorting logic
  const handleSort = (type) => {
    const newOrder = sortOption.type === type && sortOption.order === 'asc' ? 'desc' : 'asc';
    setSortOption({ type, order: newOrder });

    const sortedGames = [...games];
    switch (type) {
      case 'alphabetical':
        sortedGames.sort((a, b) =>
          newOrder === 'asc' ? a.Title.localeCompare(b.Title) : b.Title.localeCompare(a.Title)
        );
        break;
      case 'price':
        sortedGames.sort((a, b) => (newOrder === 'asc' ? a.Price - b.Price : b.Price - a.Price));
        break;
      case 'discount':
        sortedGames.sort((a, b) =>
          newOrder === 'asc' ? a.discount - b.discount : b.discount - a.discount
        );
        break;
      case 'rating':
        sortedGames.sort((a, b) => (newOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating));
        break;
      default:
        break;
    }
    setGames(sortedGames);
  };

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
      {/* Filter Overlay */}
      {showFilterOverlay && (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.9)', // White overlay with slight transparency
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000, // Ensure it appears above other elements
    }}
    onClick={() => setShowFilterOverlay(false)} // Close overlay on click
  >
    <div
      style={{
        backgroundColor: 'white',
        padding: '30px', // Increased padding for better spacing
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        textAlign: 'center',
        position: 'relative',
        width: '60%', // Set a fixed width for the filter box
        maxWidth: '800px', // Ensure it doesn't grow too large
      }}
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the box
    >
      {/* Heading */}
      <h2
        style={{
          marginBottom: '20px',
          color: 'white',
          textShadow: '2px 2px 4px black', // Black stroke effect
          backgroundColor: 'black',
          padding: '10px',
          borderRadius: '5px',
        }}
      >
        Filters
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)', // Two columns for side-by-side fields
          gap: '20px', // Space between fields
        }}
      >
        <div>
          <input
            type="text"
            name="title"
            value={filterData.title}
            onChange={handleFilterChange}
            placeholder="Title" // Placeholder for label inside the field
            style={{
              width: '95%',
              padding: '8px', // Reduced padding for smaller fields
              fontSize: '14px', // Smaller font size
              border: '1px solid #ccc',
              borderRadius: '5px',
              color: '#333',
            }}
          />
        </div>
        <div>
          <input
            type="text"
            name="publisher_name"
            value={filterData.publisher_name}
            onChange={handleFilterChange}
            placeholder="Publisher Name" // Placeholder for label inside the field
            style={{
              width: '95%',
              padding: '8px',
              fontSize: '14px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              color: '#333',
            }}
          />
        </div>
        <div>
          <input
            type="number"
            name="min_rating"
            value={filterData.min_rating}
            onChange={handleFilterChange}
            placeholder="Min Rating" // Placeholder for label inside the field
            onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault(); // Prevent non-numeric input
              }
            }}
            style={{
              width: '95%',
              padding: '8px',
              fontSize: '14px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              color: '#333',
            }}
          />
        </div>
        <div>
          <input
            type="number"
            name="max_rating"
            value={filterData.max_rating}
            onChange={handleFilterChange}
            placeholder="Max Rating" // Placeholder for label inside the field
            onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault(); // Prevent non-numeric input
              }
            }}
            style={{
              width: '95%',
              padding: '8px',
              fontSize: '14px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              color: '#333',
            }}
          />
        </div>
        <div>
          <input
            type="number"
            name="min_release_year"
            value={filterData.min_release_year}
            onChange={handleFilterChange}
            placeholder="Min Release Year" // Placeholder for label inside the field
            onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault(); // Prevent non-numeric input
              }
            }}
            style={{
              width: '95%',
              padding: '8px',
              fontSize: '14px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              color: '#333',
            }}
          />
        </div>
        <div>
          <input
            type="number"
            name="max_release_year"
            value={filterData.max_release_year}
            onChange={handleFilterChange}
            placeholder="Max Release Year" // Placeholder for label inside the field
            onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault(); // Prevent non-numeric input
              }
            }}
            style={{
              width: '95%',
              padding: '8px',
              fontSize: '14px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              color: '#333',
            }}
          />
        </div>
        <div>
          <input
            type="number"
            name="min_price"
            value={filterData.min_price}
            onChange={handleFilterChange}
            placeholder="Min Price" // Placeholder for label inside the field
            onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault(); // Prevent non-numeric input
              }
            }}
            style={{
              width: '95%',
              padding: '8px',
              fontSize: '14px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              color: '#333',
            }}
          />
        </div>
        <div>
          <input
            type="number"
            name="max_price"
            value={filterData.max_price}
            onChange={handleFilterChange}
            placeholder="Max Price" // Placeholder for label inside the field
            onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault(); // Prevent non-numeric input
              }
            }}
            style={{
              width: '95%',
              padding: '8px',
              fontSize: '14px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              color: '#333',
            }}
          />
        </div>
      </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
          <button
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              backgroundColor: 'green',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              transition: 'all 0.3s ease', // Smooth transition for hover effect
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.color = 'green';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'green';
              e.target.style.color = 'white';
            }}
            onClick={handleApplyFilter} // Apply filter on click
          >
            Apply Filter
          </button>
          <button
            style={{
              marginLeft: '-525px',
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              backgroundColor: 'blue',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              transition: 'all 0.3s ease', // Smooth transition for hover effect
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.color = 'blue';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'blue';
              e.target.style.color = 'white';
            }}
            onClick={() => setFilterData({
              title: '',
              min_rating: '',
              max_rating: '',
              publisher_name: '',
              min_release_year: '',
              max_release_year: '',
              min_price: '',
              max_price: '',
            })} // Reset filter fields
          >
            Reset
          </button>
          <button
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              backgroundColor: 'red',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              transition: 'all 0.3s ease', // Smooth transition for hover effect
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.color = 'red';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'red';
              e.target.style.color = 'white';
            }}
            onClick={() => setShowFilterOverlay(false)} // Close overlay on button click
          >
            X
          </button>
        </div>
    </div>
  </div>
)}

      {/* Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 20px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '5px',
        }}
>
  {/* Left Section: User Settings and Library */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    {/* User Settings Button */}
    <button
  style={{
    cursor: 'pointer',
    background: 'transparent', // Make background transparent
    border: 'none', // Remove border
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    maxWidth: '200px', // Ensure consistent button size
    color: 'white', // Set the default color for the button
    //width: '50px', // Ensure consistent button size
    height: '50px', // Ensure consistent button size
  }}
  onMouseOver={(e) => {
    const icon = e.currentTarget.querySelector('i'); // Target the icon inside the button
    if (icon) {
      icon.classList.remove('fa-regular'); // Remove the regular class
      icon.classList.add('fa-solid'); // Add the solid class
    }
  }}
  onMouseOut={(e) => {
    const icon = e.currentTarget.querySelector('i'); // Target the icon inside the button
    if (icon) {
      icon.classList.remove('fa-solid'); // Remove the solid class
      icon.classList.add('fa-regular'); // Add the regular class
    }
  }}
  onClick={() => navigate('/user-profile')} // Navigate to the user profile page

>
  <i className="fa-regular fa-user" style={{ fontSize: '24px', color: 'inherit' }}></i>
</button>

    {/* Library Button */}
    <button
  style={{
    cursor: 'pointer',
    background: 'transparent', // Make background transparent
    border: 'none', // Remove border
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    color: 'white', // Set the default color for the button
    width: '50px', // Ensure consistent button size
    height: '50px', // Ensure consistent button size
  }}
  onMouseOver={(e) => {
    e.target.style.color = '#c9061d'; // Change button text color (affects icon too)
    const icon = e.target.querySelector('i'); // Target the icon inside the button
    if (icon) {
      icon.style.color = '#c9061d'; // Ensure icon color matches
    }
  }}
  onMouseOut={(e) => {
    e.target.style.color = 'white'; // Reset button text color (affects icon too)
    const icon = e.target.querySelector('i'); // Target the icon inside the button
    if (icon) {
      icon.style.color = 'white'; // Ensure icon color resets
    }
  }}
  onClick={() => navigate('/library')} // Navigate to the Library page
>
  <i className="fa fa-book" style={{ fontSize: '24px', color: 'inherit' }}></i>
</button>
  </div>

  {/* Centered Title */}
  <h1 style={{ margin: 0, flex: 1, textAlign: 'center' }}>Store</h1>

  {/* Right Section: Buttons */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    {/* Search Button (Swapped with Cart) */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
  {/* Search Bar */}
  {showSearchBar && (
    <form
  onSubmit={handleSearchSubmit} // Ensure this is correctly linked
  style={{
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: '25px',
    padding: '5px 10px',
    transition: 'all 0.3s ease',
    width: '200px',
    position: 'absolute',
    right: '60px',
  }}
>
  <input
    type="text"
    placeholder="Search"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)} // Update search query state
    style={{
      border: 'none',
      outline: 'none',
      flex: 1,
      padding: '5px',
      borderRadius: '25px',
      fontSize: '16px',
    }}
  />
  <button
    type="submit" // Ensure the button type is "submit"
    style={{
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: 'black',
    }}
  >
    <i
      className="fa fa-arrow-right"
      style={{
        fontSize: '18px',
        marginLeft: '-24px',
      }}
    ></i>
  </button>
</form>

  )}

  {/* Search Button */}
  <button
    style={{
      cursor: 'pointer',
      background: 'transparent',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      color: 'white',
      width: '50px',
      height: '50px',
    }}
    onMouseOver={(e) => (e.target.style.color = '#00bfff')} // Change color to light blue on hover
    onMouseOut={(e) => (e.target.style.color = 'white')} // Reset color to white on mouse out
    onClick={() => setShowSearchBar((prev) => !prev)} // Toggle search bar visibility
  >
    <i className="fa fa-search" style={{ fontSize: '24px', color: 'inherit' }}></i>
  </button>
</div>

    {/* Filter Button */}
    <button
          style={{
            cursor: 'pointer',
            background: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            color: 'white',
            width: '50px',
            height: '50px',
          }}
          onMouseOver={(e) => {
            e.target.style.color = 'green';
            const icon = e.target.querySelector('i');
            if (icon) {
              icon.style.color = 'green';
            }
          }}
          onMouseOut={(e) => {
            e.target.style.color = 'white';
            const icon = e.target.querySelector('i');
            if (icon) {
              icon.style.color = 'white';
            }
          }}
          onClick={() => setShowFilterOverlay((prev) => !prev)} // Toggle overlay visibility
        >
          <i className="fa fa-filter" style={{ fontSize: '24px', color: 'inherit' }}></i>
        </button>

    {/* Cart Button (Swapped with Search) */}
    <button
      style={{
        cursor: 'pointer',
        background: 'transparent', // Make background transparent
        border: 'none', // Remove border
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        color: 'white', // Set the default color for the button
        width: '50px', // Ensure consistent button size
        height: '50px', // Ensure consistent button size
      }}
      onMouseOver={(e) => {
        e.target.style.color = 'orange'; // Change button text color (affects icon too)
        const icon = e.target.querySelector('i'); // Target the icon inside the button
        if (icon) {
          icon.style.color = 'orange'; // Ensure icon color matches
        }
      }}
      onMouseOut={(e) => {
        e.target.style.color = 'white'; // Reset button text color (affects icon too)
        const icon = e.target.querySelector('i'); // Target the icon inside the button
        if (icon) {
          icon.style.color = 'white'; // Ensure icon color resets
        }
      }}
      onClick={() => {
        navigate('/cart');
      }}
    >
      <i className="fa fa-shopping-cart" style={{ fontSize: '24px', color: 'inherit' }}></i>
    </button>

    {/* Logout Button */}
    <button
      style={buttonStyle('red', 'white')}
      onMouseOver={(e) => {
        e.target.style.backgroundColor = 'white';
        e.target.style.color = 'red';
      }}
      onMouseOut={(e) => {
        e.target.style.backgroundColor = 'red';
        e.target.style.color = 'white';
      }}
      onClick={handleLogout}
    >
      Logout
    </button>
  </div>
</header>
      {/* Sorting Bar */}
<div
  style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: '10px 20px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    margin: '20px auto',
    width: '35%', // Centered and responsive width
    color: 'black',
  }}
>
  {['Alphabetical', 'Price', 'Discount', 'Rating'].map((option) => (
    <button
      key={option}
      onClick={() => handleSort(option.toLowerCase())}
      style={{
        margin: '0 10px',
        padding: '10px 15px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: sortOption.type === option.toLowerCase() ? '2px solid black' : 'none',
        color: 'black',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
      }}
    >
      {option}
      {sortOption.type === option.toLowerCase() && (
        <i
          className={`fa fa-arrow-${sortOption.order === 'asc' ? 'up' : 'down'}`}
          style={{ fontSize: '14px' }}
        ></i>
      )}
    </button>
  ))}
</div>

      {/* Games List */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginTop: '20px',
        }}
      >
        {games.map((game) => (
          <div
            key={game.Game_ID}
            style={{
              position: 'relative',
              width: '100%',
              height: '400px',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              backgroundColor: 'black',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onClick={() => navigate(`/game/${game.Game_ID}`, { state: { from: 'store' } })}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'; // Slight zoom effect
              e.currentTarget.style.boxShadow = '10px 10px 10px rgba(0, 0, 0, 0.8)'; // Enhanced shadow
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)'; // Reset zoom
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'; // Reset shadow
            }}
    >
      {/* Discount Banner */}
      {game.discount > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: 'rgba(0, 255, 0, 0.8)', // Green background for discount
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          {`${game.discount}% OFF`}
        </div>
      )}

      {/* Game Image or Placeholder */}
      {game.Game_poster ? (
        <img
          src={`/images/${game.Game_poster}`} // Ensure this matches the file name in the public/images folder
          alt={game.Title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '60%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.1)', // Light background for placeholder
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          Image Not Available
        </div>
      )}

      {/* Game Information */}
      <div
        style={{
          position: 'absolute',
          bottom: '0',
          width: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)', // Black background with transparency
          color: 'white',
          padding: '15px',
          textAlign: 'center',
        }}
      >
        {/* Game Title */}
        <h3
  style={{
    margin: '0 0 10px 0', // Adjusted margin to move the title up
    fontSize: '18px',
    fontWeight: 'bold',
    marginRight: '25px', // Add margin to the right for spacing
    paddingBottom: '25px', // Add padding to the bottom for spacing
    marginBottom: '10px', // Remove bottom margin to avoid extra space
    textAlign: 'center', // Center-align the title
    overflow: 'hidden', // Hide overflow
    textOverflow: 'ellipsis', // Add ellipsis for long titles
  }}
>
  {game.Title}
</h3>

        {/* Game Price (Lower Left) */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          {game.discount > 0 ? (
            <>
              <span style={{ textDecoration: 'line-through', color: 'gray', marginRight: '10px' }}>
                ${game.Price.toFixed(2)}
              </span>
              <span style={{ color: 'green' }}>
                ${(game.Price * (1 - game.discount / 100)).toFixed(2)}
              </span>
            </>
          ) : (
            `$${game.Price.toFixed(2)}`
          )}
        </div>

        {/* Game Rating (Lower Right) */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            backgroundColor: 'rgba(255, 215, 0, 0.8)', // Gold background for rating
            color: 'black',
            padding: '5px 10px',
            borderRadius: '5px',
            paddingRight: '10px',
            marginRight: '30px',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          {game.rating}/10
        </div>
      </div>
      <div
        onClick={() => navigate(`/game/${game.Game_ID}`, { state: { from: 'store' } })}
        style={{ cursor: 'pointer' }}
      >
        {/* Game Card Content */}
      </div>
    </div>
  ))}
</div>

    </div>
  );
}
function Cart() {
  const [cartItems, setCartItems] = useState([]); // State to store cart items
  const [loading, setLoading] = useState(true); // State to show loading indicator
  const [error, setError] = useState(null); // State to handle errors
  const navigate = useNavigate();
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const userId = localStorage.getItem('userId'); // Get the current user's ID from localStorage
        if (!userId) {
          throw new Error('User not logged in');
        }

        const response = await fetch(`http://localhost:5000/api/cartview?userId=${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch cart items');
        }

        const data = await response.json();
        setCartItems(data); // Update cart items state
      } catch (err) {
        console.error('Error fetching cart items:', err);
        setError(err.message || 'Failed to load cart items');
      } finally {
        setLoading(false); // Stop loading indicator
      }
    };

    fetchCartItems();
  }, []);
  const handleRemoveGame = async (GameID) => {
    
    try {
      const userId = localStorage.getItem('userId'); // Get the current user's ID
      console.log('Game ID to remove:', GameID);
      if (!userId) {
        throw new Error('User not logged in');
      }
      
      const response = await fetch('http://localhost:5000/api/cart/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userID: userId, gameID: GameID }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove game from cart');
      }

      // Update the cart items after removal
      setCartItems((prevItems) => prevItems.filter((item) => item.GameID !== GameID));
    } catch (error) {
      console.error('Error removing game from cart:', error);
      alert('Failed to remove game from cart. Please try again.');
    }
  };

  const handleCheckout = async () => {
    try {
      const userId = localStorage.getItem('userId'); // Get the current user's ID
      if (!userId) {
        throw new Error('User not logged in');
      }
      const gameIDs = cartItems.map((item) => item.GameID);
      console.log('Game IDs for checkout:', gameIDs);
      const response = await fetch('http://localhost:5000/api/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userID: userId ,gameIDs}),
      });

      if (!response.ok) {
        throw new Error('Failed to process checkout');
      }

      // Clear the cart after successful checkout
      setCartItems([]);
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Failed to process checkout. Please try again.');
    }
  };
  if (loading) {
    return <div>Loading your cart...</div>; // Show loading indicator while fetching data
  }

  if (error) {
    return <div>Error: {error}</div>; // Show error message if fetching fails
  }

  return (
    <div
      style={{
        minHeight: '100vh', // Full viewport height
        backgroundImage: 'url(/background.jpg)', // Path to the image in the /public/images folder
        backgroundSize: 'cover', // Ensure the image covers the entire background
        backgroundPosition: 'center', // Center the image
        backgroundRepeat: 'no-repeat', // Prevent the image from repeating
        color: '#333', // Text color to contrast with the background
        padding: '20px',
      }}
    >
      

      {/* Slip Section */}
      <div
      
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent black background
        borderRadius: '10px', // Rounded corners
        padding: '0px 10px', // Add padding to create space inside the strip
        maxWidth: '1600px', // Limit the width of the slip
        margin: '10 auto 50px', // Center the slip and reduce spacing below
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Subtle shadow for the slip
      }}
      >
        {/* Cart Title */}
  <div
     style={{
      textAlign: 'center', // Center the text horizontally
      fontSize: '18px', // Slightly smaller font size
      fontWeight: 'bold', // Make the text bold
      color: 'white', // Text color
      marginBottom: '0px', // Add spacing below the text
    }}
  >
    Cart
  </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Library Button */}
          <button
            onClick={() => navigate('/library')}
            style={{
              cursor: 'pointer',
              background: 'transparent', // Make background transparent
              border: 'none', // Remove border
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              color: 'white', // Set the default color for the button
              fontSize: '16px',
            }}
            onMouseOver={(e) => {
              const icon = e.currentTarget.querySelector('i'); // Target the icon inside the button
            if (icon) {
              icon.style.color = '#007bff';
            }
            }}
            onMouseOut={(e) => {
              const icon = e.currentTarget.querySelector('i'); // Target the icon inside the button
              if (icon) {
                icon.style.color = 'white'; // Reset icon color
              }
            }}
          >
            <i className="fa-solid fa-book" style={{ fontSize: '24px', marginRight: '10px' , visibility:"visible" }}></i>
            Go to Library
          </button>

          {/* Homepage Button */}
          <button
            onClick={() => navigate('/homepage')}
            style={{
              cursor: 'pointer',
              background: 'transparent', // Make background transparent
              border: 'none', // Remove border
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              color: 'white', // Set the default color for the button
              fontSize: '16px',
            }}
            onMouseOver={(e) => {
              const icon = e.currentTarget.querySelector('i'); // Target the icon inside the button
              if (icon) {
                icon.style.color = '#28a745'; // Change icon color to green on hover
              }
            }}
            onMouseOut={(e) => {
              const icon = e.currentTarget.querySelector('i'); // Target the icon inside the button
              if (icon) {
                icon.style.color = 'white'; // Reset icon color to white
              }
            }}
          >
            <i className="fa-solid fa-home" style={{ fontSize: '24px', marginRight: '10px' }}></i>
            Go to Homepage
          </button>
        </div>
      </div>
      
      {cartItems.length > 0 ? (
        <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', // Responsive grid layout
          gap: '20px', // Space between grid items
          justifyContent: 'start', // Center the items horizontally
          alignItems: 'start', // Align items at the top
          maxWidth: '1200px', // Maximum width for the grid
          padding: '20px',
          margin: '0 auto', // Center the grid container on the page

        }}
        >
          {cartItems.map((item) => (
            <div
              key={item.GameID}
              style={{
                border: '1px solid #ddd', // Softer border color
                borderRadius: '0px', // Slightly more rounded corners
                padding: '5px', // Increased padding for better spacing
                textAlign: 'center',
                backgroundColor: 'black', // Light grey background for a cleaner look
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Subtle shadow for a card effect
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                maxWidth: '300px', // Prevent the card from stretching too wide
                //margin: '0 auto',  // Smooth hover effect
                cursor: 'pointer',
              }}
              onClick={() => navigate(`/game/${item.GameID}`, { state: { from: 'cart' } })}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = '10px 10px 10px rgba(0, 0, 0, 0.8)'; // Enhanced shadow on hover
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)'; // Reset shadow
              }}
            >
              <img
                src={`/images/${item.Game_Poster}`} // Fetch image from /public/images folder
                alt={item.Game_Title}
                style={{
                  width: '100%',
                  height: '350px',
                  objectFit: 'cover',
                  borderRadius: '0px',
                }}
              />
              <h3 style={{ margin: '10px 0', fontSize: '18px', color: 'White' }}>{item.Game_Title}</h3>
    <p style={{ margin: '5px 0', fontSize: '16px', color: 'white' }}>Price: ${item.Game_Price}</p>
    <p style={{ margin: '5px 0', fontSize: '16px', color: 'White' }}>Quantity: {item.Quantity}</p>
    <p style={{ margin: '5px 0', fontSize: '16px', color: 'White' }}>Total: ${item.Total_Price}</p>
    <button
      onClick={(e) => {
        e.stopPropagation(); // Prevent the parent card's onClick from being triggered
        handleRemoveGame(item.GameID); // Perform the remove functionality
      }}
      style={{
        marginTop: '10px',
        padding: '10px 15px',
        fontSize: '14px',
        backgroundColor: 'red',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'box-shadow 0.3s ease, transform 0.3s ease', // Smooth transition for hover effect
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.boxShadow = '0 0 10px 2px rgba(120, 0, 0, 0.8)'; // Red glow effect
        e.currentTarget.style.transform = 'scale(1.02)'; // Slight zoom effect
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.boxShadow = 'none'; // Remove glow effect
        e.currentTarget.style.transform = 'scale(1)'; // Reset zoom
      }}
    >
      Remove
    </button>
                {/* Game Card Content */}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ textAlign: 'center', fontSize: '18px', color: '#fff' }}>Your cart is empty.</p>
      )}
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button
          onClick={handleCheckout} // Checkout functionality
          style={{
            padding: '15px 30px',
            fontSize: '16px',
            backgroundColor: 'green',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'box-shadow 0.3s ease, transform 0.3s ease', // Smooth transition for hover effect
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.boxShadow = '0 0 10px 2px rgba(0, 0, 0, 0.8)'; // Green glow effect
            e.currentTarget.style.transform = 'scale(1.02)'; // Slight zoom effect
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.boxShadow = 'none'; // Remove glow effect
            e.currentTarget.style.transform = 'scale(1)'; // Reset zoom
          }}
        >
          Purchase
        </button>
      </div>
    </div>
  );
}
function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Failed to log in');
      }

      const data = await response.json();
      if (data.userId === -1) {
        setLoginMessage("Invalid username or password.");
        localStorage.removeItem('userId'); // Clear any previously stored userId
      } else {
        localStorage.setItem('userId', data.userId); // Save user ID to local storage
        setLoginMessage("Login successful!");
        navigate('/homepage'); // Navigate to the homepage
      }
    } catch (error) {
      console.error('Error during login:', error);
      setLoginMessage(error.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div
      style={{
        textAlign: 'left',
        minHeight: '94.5vh', // Ensures the background covers the full viewport height
        backgroundImage: 'url("/loginpage.jpg")', // Replace with your image path
        backgroundSize: 'cover', // Ensures the image covers the entire background
        backgroundPosition: 'center', // Centers the image
        backgroundRepeat: 'no-repeat', // Prevents the image from repeating
        color: 'white', // Ensures text is visible on the background
        padding: '20px',
        position: 'relative', // Allows absolute positioning of child elements
      }}
    >
      <h1
        style={{
          position: 'absolute', // Allows precise positioning
          top: '90px', // y-coordinate
          left: '600px', // x-coordinate
          fontSize: '34px',
          fontWeight: 'bold',
        }}
      >
        Welcome to, Kattuti
      </h1>
      <form
        onSubmit={handleLogin}
        style={{
          position: 'absolute', // Allows precise positioning
          top: '250px', // y-coordinate
          left: '500px', // x-coordinate
          transform: 'translate(0, 0)', // Fine-tune the position
        }}
      >
        <div style={{ marginBottom: '15px' }}>
          <label
            style={{
              display: 'block',
              fontWeight: 'bold',
              marginBottom: '10px',
            }}
          >
            Username:
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: '300px',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
            required
          />
        </div>
        <div style={{ position: 'relative', marginBottom: '15px' }}>
          <label
            style={{
              display: 'block',
              fontWeight: 'bold',
              marginBottom: '5px',
            }}
          >
            Password:
          </label>
          <input
            type={showPassword ? "text" : "password"} // Toggle input type
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '270px',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              paddingRight: '40px', // Add space for the icon
            }}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)} // Toggle visibility
            style={{
              position: 'absolute',
              right: '10px',
              top: '72%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <i
              className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}
              style={{ fontSize: '18px', color: 'black' }}
            ></i>
          </button>
        </div>
        <button
          type="submit"
          style={{
            position: 'absolute', // Allows precise positioning
            top: '220px', // y-coordinate
            left: '10px', // x-coordinate
            transform: 'translate(0, 0)', // Fine-tune the position
            padding: '12px 40px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: 'green',
            color: 'White',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          Login
        </button>
        <button
        type="button"
        style={{
          position: 'absolute',
          top: '220px', // y-coordinate for Sign Up button (below Login button)
          left: '180px', // x-coordinate (aligned with Login button)
          transform: 'translate(0, 0)',
          padding: '12px 38px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: 'green', // Different color for Sign Up button
          color: 'white',
          border: 'none',
          whiteSpace: 'nowrap',
          borderRadius: '5px',
        }}
        onClick={() => navigate('/signup')}      >
        Sign Up
      </button>
      </form>
      {loginMessage && (
  <p
    style={{
      position: 'absolute', // Allows precise positioning
      top: '540px', // Adjust y-coordinate to position below the buttons
      left: '700px', // Adjust x-coordinate to align with the form
      transform: 'translate(0, 0)', // Fine-tune the position
      fontSize: '22px',
      color: loginMessage.includes('successful') ? 'green' : 'red',
      textAlign: 'center', // Centers the text horizontally
    }}
  >
    {loginMessage}
  </p>
)}
    </div>
  );
}
function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    date_of_birth: '',
  });
  const [signupMessage, setSignupMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const signupResponse = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!signupResponse.ok) {
        const errorData = await signupResponse.json();
        throw new Error(errorData.error || 'Signup failed');
      }

      const loginResponse = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        throw new Error(errorData.error || 'Login failed after signup');
      }

      const loginData = await loginResponse.json();
      localStorage.setItem('userId', loginData.userId); // Save user ID to local storage
      setSignupMessage('Signup successful! Redirecting to homepage...');
      navigate('/homepage'); // Navigate to the homepage
    } catch (error) {
      console.error('Error during signup:', error);
      setSignupMessage(error.message || 'Signup failed. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div
      style={{
        textAlign: 'center',
        minHeight: '94.5vh',
        backgroundImage: 'url("/searchpage.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: 'white',
        padding: '20px',
        position: 'relative',
      }}
    >
      <h1
        style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translate(-50%, 0)',
        }}
      >
        Sign Up
      </h1>
      <form
        onSubmit={handleSignup}
        style={{
          position: 'relative',
          top: '100px',
          left: '50%',
          transform: 'translate(-50%, 0)',
          width: '400px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '0px',
            left: '0px',
            width: '100%',
          }}
        >
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
            required
          />
        </div>
        <div
          style={{
            position: 'absolute',
            top: '80px',
            left: '0px',
            width: '100%',
          }}
        >
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Password:</label>
          <input
            type={showPassword ? 'text' : 'password'} // Toggle input type
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={{
              width: '90%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              paddingRight: '50px', // Add space for the icon
            }}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)} // Toggle visibility
            style={{
              position: 'absolute',
              right: '-10px',
              top: '70%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <i
              className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}
              style={{ fontSize: '18px', color: 'black' }}
            ></i>
          </button>
        </div>
        <div
          style={{
            position: 'absolute',
            top: '160px',
            left: '0px',
            width: '100%',
          }}
        >
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
            required
          />
        </div>
        <div
          style={{
            position: 'absolute',
            top: '240px',
            left: '0px',
            width: '100%',
          }}
        >
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Date of Birth:</label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
            required
          />
        </div>
        <button
          type="submit"
          style={{
            position: 'absolute',
            top: '370px',
            left: '0px',
            width: '106%',
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: 'green',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          Sign Up
        </button>
      </form>
      {signupMessage && (
        <p style={{ color: signupMessage.includes('successful') ? 'green' : 'red' }}>
          {signupMessage}
        </p>
      )}
    </div>
  );
}

function Library() {
  const [games, setGames] = useState([]); // User's library games
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId'); // Retrieve user ID from local storage
  const [showSearchBar, setShowSearchBar] = useState(false); // State to toggle search bar visibility
  const [searchQuery, setSearchQuery] = useState(''); // State to store the search input
  const [sortOption, setSortOption] = useState({ type: '', order: 'asc' }); // Sorting state

  // Fetch library games from the API
  useEffect(() => {
    const fetchLibraryGames = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/library/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch library games');
        }
        const data = await response.json();
        setGames(data);
      } catch (error) {
        console.error('Error fetching library games:', error);
      }
    };

    fetchLibraryGames();
  }, [userId]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('userId'); // Clear user ID from local storage
    navigate('/'); // Redirect to login page
  };

  // Sorting logic
  const handleSort = (type) => {
    const newOrder = sortOption.type === type && sortOption.order === 'asc' ? 'desc' : 'asc';
    setSortOption({ type, order: newOrder });

    const sortedGames = [...games];
    switch (type) {
      case 'alphabetical':
        sortedGames.sort((a, b) =>
          newOrder === 'asc' ? a.Title.localeCompare(b.Title) : b.Title.localeCompare(a.Title)
        );
        break;
      case 'rating':
        sortedGames.sort((a, b) => (newOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating));
        break;
      default:
        break;
    }
    setGames(sortedGames);
  };

  // Handle search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Search triggered:', searchQuery); // Placeholder for search functionality
    // Add your search logic here
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: 'url("/background.jpg")', // Same background as homepage
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: 'white',
        padding: '20px',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 20px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
          borderRadius: '5px',
        }}
      >
        {/* Left Section: User Settings and Home */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* User Settings Button */}
          <button
            style={{
              cursor: 'pointer',
              background: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              color: 'white',
              width: '50px',
              height: '50px',
            }}
            onMouseOver={(e) => {
              const icon = e.currentTarget.querySelector('i');
              if (icon) {
                icon.classList.remove('fa-regular');
                icon.classList.add('fa-solid');
              }
            }}
            onMouseOut={(e) => {
              const icon = e.currentTarget.querySelector('i');
              if (icon) {
                icon.classList.remove('fa-solid');
                icon.classList.add('fa-regular');
              }
            }}
            onClick={() => navigate('/user-profile')}
          >
            <i className="fa-regular fa-user" style={{ fontSize: '24px', color: 'inherit' }}></i>
          </button>

          {/* Home Button */}
          <button
            style={{
              cursor: 'pointer',
              background: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              color: 'white',
              width: '50px',
              height: '50px',
            }}
            onMouseOver={(e) => (e.target.style.color = '#c9061d')}
            onMouseOut={(e) => (e.target.style.color = 'white')}
            onClick={() => navigate('/homepage')} // Navigate to homepage
          >
            <i className="fa fa-home" style={{ fontSize: '24px', color: 'inherit' }}></i>
          </button>
        </div>

        {/* Centered Title */}
        <h1 style={{ margin: 0, flex: 1, textAlign: 'center' }}>Library</h1>

        {/* Right Section: Search, Filter, Cart, and Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Cart Button */}
          <button
            style={{
              cursor: 'pointer',
              background: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              color: 'white',
              width: '50px',
              height: '50px',
            }}
            onMouseOver={(e) => (e.target.style.color = 'orange')}
            onMouseOut={(e) => (e.target.style.color = 'white')}
            onClick={() => console.log('Cart button clicked')}
          >
            <i className="fa fa-shopping-cart" style={{ fontSize: '24px', color: 'inherit' }}></i>
          </button>

          {/* Logout Button */}
          <button
            style={{
              padding: '10px',
              fontSize: '16px',
              cursor: 'pointer',
              backgroundColor: 'red',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.color = 'red';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'red';
              e.target.style.color = 'white';
            }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Sorting Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'white',
          padding: '10px 20px',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          margin: '20px auto',
          width: '35%',
          color: 'black',
        }}
      >
        {['Alphabetical', 'Rating'].map((option) => (
          <button
            key={option}
            onClick={() => handleSort(option.toLowerCase())}
            style={{
              margin: '0 10px',
              padding: '10px 15px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: sortOption.type === option.toLowerCase() ? '2px solid black' : 'none',
              color: 'black',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            {option}
            {sortOption.type === option.toLowerCase() && (
              <i
                className={`fa fa-arrow-${sortOption.order === 'asc' ? 'up' : 'down'}`}
                style={{ fontSize: '14px' }}
              ></i>
            )}
          </button>
        ))}
      </div>

      {/* Games List */}
      {games.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginTop: '20px',
          }}
        >
          {games.map((game) => (
            <div
              key={game.Game_ID}
              style={{
                position: 'relative',
                width: '100%',
                height: '400px',
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                backgroundColor: 'black',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onClick={() => navigate(`/game/${game.Game_ID}`, { state: { from: 'library' } })} // Navigate to GameDetails
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'; // Slight zoom effect
                e.currentTarget.style.boxShadow = '10px 10px 10px rgba(0, 0, 0, 0.8)'; // Enhanced shadow
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)'; // Reset zoom
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'; // Reset shadow
              }}
            >
              {/* Game Image or Placeholder */}
              {game.Game_poster ? (
                <img
                  src={`/images/${game.Game_poster}`}
                  alt={game.Title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '60%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}
                >
                  Image Not Available
                </div>
              )}

              {/* Game Information */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '0',
                  width: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  color: 'white',
                  padding: '15px',
                  textAlign: 'center',
                }}
              >
                {/* Game Title */}
                <h3
                style={{
                  margin: '0 0 10px 0', // Adjusted margin to move the title up
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginRight: '25px', // Add margin to the right for spacing
                  paddingBottom: '25px', // Add padding to the bottom for spacing
                  marginBottom: '10px', // Remove bottom margin to avoid extra space
                  textAlign: 'center', // Center-align the title
                  overflow: 'hidden', // Hide overflow
                  textOverflow: 'ellipsis', // Add ellipsis for long titles
                }}
>
                  {game.Title}
                </h3>

                {/* Game Rating (Lower Right) */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(255, 215, 0, 0.8)', // Gold background for rating
                    color: 'black',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    paddingRight: '10px',
                    marginRight: '30px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  {game.rating}/10
                </div>
              </div>
                {/* Game Card Content */}
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white',
            color: 'black',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          No games available to play.
        </div>
      )}
    </div>
  );
}

function UserProfile() {
  const [userProfile, setUserProfile] = useState({
      username: '',
      photo: '',
      accountLevel: '',
      password: '',
      email: '',
      birthDate: '',
      wallet: 0,
  }); // User profile data
  const [newFunds, setNewFunds] = useState(0); // Amount to add to wallet
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId'); // Get logged-in user's ID from localStorage

  // Fetch user profile from the backend
  useEffect(() => {
      const fetchUserProfile = async () => {
          try {
              const response = await fetch(`http://localhost:5000/api/user/profile/${userId}`);
              if (!response.ok) {
                  throw new Error('Failed to fetch user profile');
              }
              const data = await response.json();
              setUserProfile({
                  username: data.username,
                  photo: `/images/${data.user_profile_image}`, // Use the image path from the database
                  accountLevel: data.account_level,
                  password: '********', // Mask the password
                  email: data.email,
                  birthDate: data.date_of_birth,
                  wallet: data.wallet,
              });
          } catch (error) {
              console.error('Error fetching user profile:', error);
          }
      };

      if (userId) {
          fetchUserProfile();
      }
  }, [userId]);

  // Handle profile updates
  const handleProfileUpdate = async () => {
      try {
          const response = await fetch('http://localhost:5000/api/user/profile', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  userID: userId,
                  newUsername: userProfile.username,
                  newEmail: userProfile.email,
                  newPassword: userProfile.password,
              }),
          });
          const data = await response.json();
          alert(data.message); // Show success message
      } catch (error) {
          console.error('Error updating profile:', error);
      }
  };

  // Handle adding funds to wallet
  const handleAddFunds = async () => {
      try {
          const response = await fetch('http://localhost:5000/api/user/wallet', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  userID: userId,
                  amount: newFunds,
              }),
          });
          const data = await response.json();
          alert(data.message); // Show success message
          setUserProfile((prev) => ({ ...prev, wallet: prev.wallet + newFunds })); // Update wallet locally
          setNewFunds(0); // Reset funds input
      } catch (error) {
          console.error('Error adding funds:', error);
      }
  };

  // Handle photo upload
  // const handlePhotoUpload = async (e) => {
  //     const file = e.target.files[0];
  //     if (file) {
  //         const formData = new FormData();
  //         formData.append('photo', file);
  //         formData.append('userID', userId);

  //         try {
  //             const response = await fetch('http://localhost:5000/api/user/photo', {
  //                 method: 'POST',
  //                 body: formData,
  //             });
  //             const data = await response.json();
  //             alert(data.message); // Show success message
  //             setUserProfile((prev) => ({ ...prev, photo: `/images/${data.newPhoto}` })); // Update photo locally
  //         } catch (error) {
  //             console.error('Error uploading photo:', error);
  //         }
  //     }
  // };

  return (
      <div
          style={{
              minHeight: '100vh',
              backgroundImage: 'url("/background.jpg")', // Same background as homepage
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              color: 'white',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
          }}
      >
          {/* User Photo */}
          {/* <div style={{ position: 'relative', marginBottom: '20px' }}>
              <img
                  src={userProfile.photo}
                  alt="User"
                  style={{
                      width: '300px', // Three times bigger
                      height: '300px',
                      borderRadius: '50%', // Circle
                      objectFit: 'cover',
                      border: '3px solid white',
                  }}
              />
              <label
                  htmlFor="photoUpload"
                  style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      backgroundColor: 'blue',
                      color: 'white',
                      padding: '10px',
                      borderRadius: '40%',
                      cursor: 'pointer',
                  }}
              >
                  <i className="fa fa-camera" style={{ fontSize: '20px' }}></i>
              </label>
              <input
                  id="photoUpload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePhotoUpload}
              />
          </div> */}

          {/* Username and Account Level */}
          <h1 style={{ textAlign: 'center', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Hey! {userProfile.username}
              <span
                  style={{
                      backgroundColor: 'lightblue',
                      color: 'black',
                      padding: '5px 10px',
                      borderRadius: '50%',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      transform: 'translateY(5px)',
                  }}
              >
                  {userProfile.accountLevel}
              </span>
          </h1>

          {/* Editable Fields */}
          <div style={{ marginBottom: '15px', width: '30%' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Username:</label>
              <div style={{ position: 'relative' }}>
                  <input
                      type="text"
                      value={userProfile.username}
                      onChange={(e) => setUserProfile({ ...userProfile, username: e.target.value })}
                      style={{
                          width: '100%',
                          padding: '10px',
                          fontSize: '16px',
                          border: '1px solid #ccc',
                          borderRadius: '25px',
                          backgroundColor: 'white',
                      }}
                  />
                  <i
                      className="fa fa-pen"
                      style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '16px',
                          cursor: 'pointer',
                          color: 'blue',
                      }}
                      title="Editable"
                  ></i>
              </div>
          </div>
          <div style={{ marginBottom: '15px', width: '30%' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Password:</label>
              <div style={{ position: 'relative' }}>
                  <input
                      type="password"
                      value={userProfile.password}
                      onChange={(e) => setUserProfile({ ...userProfile, password: e.target.value })}
                      style={{
                          width: '100%',
                          padding: '10px',
                          fontSize: '16px',
                          border: '1px solid #ccc',
                          borderRadius: '25px',
                          backgroundColor: 'white',
                      }}
                  />
                  <i
                      className="fa fa-pen"
                      style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '16px',
                          cursor: 'pointer',
                          color: 'blue',
                      }}
                      title="Editable"
                  ></i>
              </div>
          </div>
          <div style={{ marginBottom: '15px', width: '30%' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Email:</label>
              <div style={{ position: 'relative' }}>
                  <input
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                      style={{
                          width: '100%',
                          padding: '10px',
                          fontSize: '16px',
                          border: '1px solid #ccc',
                          borderRadius: '25px',
                          backgroundColor: 'white',
                      }}
                  />
                  <i
                      className="fa fa-pen"
                      style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '16px',
                          cursor: 'pointer',
                          color: 'blue',
                      }}
                      title="Editable"
                  ></i>
              </div>
          </div>
          <div style={{ marginBottom: '15px', width: '30%', position: 'relative' }}>
  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Birth Date:</label>
  <input
      type="text"
      value={userProfile.birthDate}
      readOnly
      style={{
          width: '100%',
          padding: '10px',
          fontSize: '16px',
          border: '1px solid #ccc',
          borderRadius: '25px',
          backgroundColor: 'white',
          color: 'black', // Always black for the value
      }}
  />
  <span
      style={{
          position: 'absolute',
          right: '15px',
          top: '50%',
          transform: 'translateY(10%)',
          fontSize: '14px',
          color: '#555', // Dark grey for the format
          pointerEvents: 'none', // Prevent interaction with the span
      }}
  >
      yyyy-mm-dd
  </span>
</div>

          {/* Wallet Section */}
<div style={{ marginBottom: '15px', width: '30%' }}>
  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Wallet:</label>
  <div style={{ position: 'relative' }}>
      <input
          type="text"
          value={`Current: $${userProfile.wallet}`}
          readOnly
          style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '25px',
              backgroundColor: '#f0f0f0', // Light gray to indicate it's read-only
              marginBottom: '10px',
          }}
      />
      <input
          type="number"
          placeholder="Add funds"
          value={newFunds}
          onChange={(e) => setNewFunds(Number(e.target.value))}
          style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '25px',
              backgroundColor: 'white',
          }}
      />
      <button
          onClick={handleAddFunds}
          style={{
              position: 'absolute',
              right: '10px',
              top: '78%',
              transform: 'translateY(-50%)',
              padding: '5px 10px',
              fontSize: '14px',
              cursor: 'pointer',
              backgroundColor: 'green',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
          }}
      >
          Add
      </button>
  </div>
</div>

          {/* Save Changes and Back to Homepage */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '210px', marginTop: '30px' }}>
        <button
          onClick={handleProfileUpdate}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: 'green',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
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
                  Save Changes
                  </button>
        <button
          onClick={() => navigate(-1)} // Navigate back to the previous page
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: 'red',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            transition: 'all 0.3s ease',
            transform: 'translate(20px, 0px)', // Move 50px right and 20px down
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = 'white';
            e.target.style.color = 'red';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'red';
            e.target.style.color = 'white';
          }}
              >
                  Back 
              </button>
          </div>
      </div>
  );
}


function App() {
  const userId = localStorage.getItem('userId'); // Retrieve user ID from local storage

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/homepage" element={userId ? <Homepage /> : <Login />} />
        <Route path="/user-profile" element={userId ? <UserProfile /> : <Login />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/library" element={userId ? <Library /> : <Login />} />
        <Route path="/game/:gameID" element={<GameDetails />} /> {/* Game Details Route */}
      </Routes>
    </Router>
  );
}

export default App;