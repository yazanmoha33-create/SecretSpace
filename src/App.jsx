import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import './App.css';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, username, password);
      setUser(userCredential.user);
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
    }
  };

  return (
    <div className={`app-container ${isDarkMode ? 'dark' : 'light'}`}>
      {/* زر تغيير الوضع في الأعلى بالزاوية */}
      <div className="top-bar-settings">
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          {isDarkMode ? 'Light Mode ☀️' : 'Dark Mode 🌙'}
        </button>
      </div>

      <div className="main-layout">
        {/* النصوص والشعار في الأعلى تماماً */}
        <div className="hero-section">
          <div className="logo-area">
            <span className="logo-text">SecretSpace</span>
            <span className="logo-icon">🔒</span>
          </div>
          <h1>Your space. Your media. <span className="highlight-text">Your privacy</span></h1>
          <p>Secure storage for your private photos and videos with absolute safety</p>
        </div>

        {/* بطاقة تسجيل الدخول في منتصف الشاشة */}
        <div className="login-card">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Sign in to access your private space</p>
          </div>

          {user ? (
            <div className="success-message" style={{ textAlign: 'center' }}>
              <h3>Welcome, {user.email}!</h3>
              <p>You have successfully logged in to your Vault.</p>
            </div>
          ) : (
            <form className="login-form" onSubmit={handleLogin}>
              {error && <p style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center' }}>{error}</p>}
              
              <div className="input-group">
                <label>Username / Email</label>
                <div className="input-wrapper">
                  <span className="icon">👤</span>
                  <input 
                    type="text" 
                    placeholder="Enter your username or email" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <span className="icon">🔒</span>
                  <input 
                    type="password" 
                    placeholder="••••••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="login-btn">
                Login to Vault
              </button>
            </form>
          )}
        </div>
      </div>

      <footer className="footer-copyright">
        ©SecretSpace. All rights reserved 2026
      </footer>
    </div>
  );
}
