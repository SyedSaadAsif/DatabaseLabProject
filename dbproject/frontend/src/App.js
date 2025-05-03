import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const navigate = useNavigate(); // Import and use the hook correctly

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
      //navigate('/dashboard'); // Redirect to another page after successful login
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
        Welcome to the Login Page
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
        <div style={{ marginBottom: '15px' }}>
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
  const [signupMessage, setSignupMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Signup failed');
      }

      const data = await response.json();
      setSignupMessage(data.message || "Signup successful!");
    } catch (error) {
      console.error('Error during signup:', error);
      setSignupMessage(error.message || "Signup failed. Please try again.");
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
      position: 'relative', // Allows absolute positioning of child elements
    }}
  >
    <h1
      style={{
        position: 'absolute',
        top: '20px', // y-coordinate for the title
        left: '50%', // x-coordinate for the title
        transform: 'translate(-50%, 0)', // Center the title horizontally
      }}
    >
      Sign Up
    </h1>
    <form
      onSubmit={handleSignup}
      style={{
        position: 'relative', // Allows absolute positioning of form fields
        top: '100px', // y-coordinate for the form
        left: '50%', // x-coordinate for the form
        transform: 'translate(-50%, 0)', // Center the form horizontally
        width: '400px', // Set a fixed width for the form
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '0px', // y-coordinate for Username field
          left: '0px', // x-coordinate for Username field
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
          top: '80px', // y-coordinate for Password field
          left: '0px', // x-coordinate for Password field
          width: '100%',
        }}
      >
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Password:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
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
          top: '160px', // y-coordinate for Email field
          left: '0px', // x-coordinate for Email field
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
          top: '240px', // y-coordinate for Date of Birth field
          left: '0px', // x-coordinate for Date of Birth field
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
          top: '370px', // y-coordinate for Submit button
          left: '0px', // x-coordinate for Submit button
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;