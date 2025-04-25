import React, { useState } from 'react';

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent page reload on form submission
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json(); // Assuming backend returns JSON
      setLoginMessage(`Login successful! User ID: ${data.userId}`);
    } catch (error) {
      console.error('Error during login:', error);
      setLoginMessage(error.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div
      style={{
        textAlign: 'center',
        minHeight: '100vh', // Ensures the background covers the full viewport height
        backgroundImage: 'url("/background1.png")', // Replace with your image path
        backgroundSize: 'cover', // Ensures the image covers the entire background
        backgroundPosition: 'center', // Centers the image
        backgroundRepeat: 'no-repeat', // Prevents the image from repeating
        color: 'white', // Ensures text is visible on the background
        padding: '20px',
      }}
    >
      <h1>Welcome to the Login Page</h1>
      <form onSubmit={handleLogin} style={{ display: 'inline-block', textAlign: 'left' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Username:</label>
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
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: 'orange', // Orange button
            color: 'white', // White text on button
            border: 'none',
            borderRadius: '5px',
          }}
        >
          Login
        </button>
      </form>
      {loginMessage && (
        <p style={{ marginTop: '20px', fontSize: '18px', color: loginMessage.includes('successful') ? 'green' : 'red' }}>
          {loginMessage}
        </p>
      )}
    </div>
  );
}

export default App;