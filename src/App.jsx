import React, { useState } from 'react';
import './App.css';

function App() {
  const [theme, setTheme] = useState('light');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // طرق التنقل بين النماذج (login, signup, forgot)
  const [authMode, setAuthMode] = useState('login'); // 'login', 'signup', 'forgot'
  
  // حقول الإدخال
  const [identifier, setIdentifier] = useState(''); // البريد الإلكتروني أو رقم الهاتف
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [activeTab, setActiveTab] = useState('gallery');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [images, setImages] = useState([]);
  const [trash, setTrash] = useState([]);

  // معالجة تسجيل الدخول
  const handleLogin = (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      setErrorMsg('Please enter email/phone and password');
      return;
    }
    setErrorMsg('');
    setIsLoggedIn(true);
  };

  // معالجة إنشاء حساب جديد
  const handleSignup = (e) => {
    e.preventDefault();
    if (!identifier || !password || !confirmPassword) {
      setErrorMsg('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('Account created successfully! Please sign in.');
    setTimeout(() => {
      setAuthMode('login');
      setSuccessMsg('');
    }, 1500);
  };

  // معالجة استعادة كلمة المرور
  const handleForgot = (e) => {
    e.preventDefault();
    if (!identifier) {
      setErrorMsg('Please enter your email or phone number');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('Password reset instructions sent to your identifier.');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newImg = {
        id: Date.now(),
        url: URL.createObjectURL(file),
        category: selectedCategory === 'All' ? 'Nature' : selectedCategory
      };
      setImages([newImg, ...images]);
    }
  };

  const handleDeleteImage = (id) => {
    const imgToDelete = images.find(img => img.id === id);
    if (imgToDelete) {
      setImages(images.filter(img => img.id !== id));
      setTrash([imgToDelete, ...trash]);
    }
  };

  const handleRestoreImage = (id) => {
    const imgToRestore = trash.find(img => img.id === id);
    if (imgToRestore) {
      setTrash(trash.filter(img => img.id !== id));
      setImages([imgToRestore, ...images]);
    }
  };

  const handlePermanentDelete = (id) => {
    setTrash(trash.filter(img => img.id !== id));
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const filteredImages = selectedCategory === 'All' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  return (
    <div className={`app-container ${theme}`}>
      <div className="top-bar-settings">
        <button onClick={toggleTheme} className="theme-toggle-btn">
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
      </div>

      <div className={`main-layout ${isLoggedIn ? 'expanded-layout' : ''}`}>
        <div className="hero-section">
          <div className="logo-area">
            <span className="logo-icon">🔒</span>
            <span className="logo-text">Photo Vault</span>
          </div>
          <h1>Welcome to <span className="highlight-text">Secure System</span></h1>
          <p>Manage your private photos securely and easily inside an advanced environment</p>
        </div>

        <div className={`login-card ${isLoggedIn ? 'vault-card-wide' : ''}`}>
          {!isLoggedIn ? (
            <div className="animate-fade">
              
              {/* نموذج تسجيل الدخول */}
              {authMode === 'login' && (
                <>
                  <div className="login-header">
                    <h2>Sign In</h2>
                    <p>Enter your credentials to access the vault</p>
                  </div>

                  <form onSubmit={handleLogin} className="login-form">
                    {errorMsg && <p className="error-text">{errorMsg}</p>}
                    {successMsg && <p className="success-text">{successMsg}</p>}
                    
                    <div className="input-group">
                      <label>Email or Phone Number</label>
                      <div className="input-wrapper">
                        <span className="icon">📧</span>
                        <input 
                          type="text" 
                          placeholder="Enter email or phone"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <label>Password</label>
                      <div className="input-wrapper">
                        <span className="icon">🔑</span>
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <span 
                        className="link-text forgot-link-inline" 
                        onClick={() => { setAuthMode('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                      >
                        Forgot Password?
                      </span>
                    </div>

                    <button type="submit" className="login-btn">Enter Vault</button>

                    <div className="form-actions-bottom">
                      <span>Don't have an account? </span>
                      <span 
                        className="link-text" 
                        onClick={() => { setAuthMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
                      >
                        Sign Up
                      </span>
                    </div>
                  </form>
                </>
              )}

              {/* نموذج إنشاء حساب جديد */}
              {authMode === 'signup' && (
                <>
                  <div className="login-header">
                    <h2>Create Account</h2>
                    <p>Register a new vault account</p>
                  </div>

                  <form onSubmit={handleSignup} className="login-form">
                    {errorMsg && <p className="error-text">{errorMsg}</p>}
                    {successMsg && <p className="success-text">{successMsg}</p>}
                    
                    <div className="input-group">
                      <label>Email or Phone Number</label>
                      <div className="input-wrapper">
                        <span className="icon">📧</span>
                        <input 
                          type="text" 
                          placeholder="Enter email or phone"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <label>Password</label>
                      <div className="input-wrapper">
                        <span className="icon">🔑</span>
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <label>Confirm Password</label>
                      <div className="input-wrapper">
                        <span className="icon">🔐</span>
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <button type="submit" className="login-btn">Register</button>

                    <div className="form-actions-bottom">
                      <span>Already have an account? </span>
                      <span 
                        className="link-text" 
                        onClick={() => { setAuthMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                      >
                        Sign In
                      </span>
                    </div>
                  </form>
                </>
              )}

              {/* نموذج نسيان كلمة المرور */}
              {authMode === 'forgot' && (
                <>
                  <div className="login-header">
                    <h2>Reset Password</h2>
                    <p>Enter your email or phone to reset password</p>
                  </div>

                  <form onSubmit={handleForgot} className="login-form">
                    {errorMsg && <p className="error-text">{errorMsg}</p>}
                    {successMsg && <p className="success-text">{successMsg}</p>}
                    
                    <div className="input-group">
                      <label>Email or Phone Number</label>
                      <div className="input-wrapper">
                        <span className="icon">📧</span>
                        <input 
                          type="text" 
                          placeholder="Enter email or phone"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                        />
                      </div>
                    </div>

                    <button type="submit" className="login-btn">Send Reset Link</button>

                    <div className="form-actions-bottom">
                      <span 
                        className="link-text" 
                        onClick={() => { setAuthMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                      >
                        Back to Sign In
                      </span>
                    </div>
                  </form>
                </>
              )}

            </div>
          ) : (
            <div className="vault-container">
              <div className="vault-header">
                <h2>Private Photo Vault</h2>
                <p className="vault-user-email">Account: {identifier}</p>
              </div>

              <div className="vault-nav-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
                  onClick={() => setActiveTab('gallery')}
                >
                  📁 Gallery ({images.length})
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'trash' ? 'active' : ''}`}
                  onClick={() => setActiveTab('trash')}
                >
                  🗑️ Trash ({trash.length})
                </button>
              </div>

              {activeTab === 'gallery' && (
                <>
                  <div className="categories-bar">
                    {['All', 'Nature', 'Scenery'].map(cat => (
                      <button 
                        key={cat}
                        className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="upload-section">
                    <label className="upload-btn">
                      ➕ Upload New Image
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>
                  </div>

                  <div className="gallery-grid-full">
                    {filteredImages.length > 0 ? (
                      filteredImages.map(img => (
                        <div key={img.id} className="image-card-full">
                          <img src={img.url} alt="Vault item" />
                          <span className="img-badge">{img.category}</span>
                          <button 
                            className="delete-icon-btn"
                            onClick={() => handleDeleteImage(img.id)}
                            title="Delete"
                          >
                            ❌
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="no-images-text">No images added in this section yet. Upload your first image!</p>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'trash' && (
                <div className="gallery-grid-full">
                  {trash.length > 0 ? (
                    trash.map(img => (
                      <div key={img.id} className="image-card-full">
                        <img src={img.url} alt="Deleted item" style={{ opacity: 0.6 }} />
                        <div className="trash-actions">
                          <button className="restore-btn" onClick={() => handleRestoreImage(img.id)}>Restore</button>
                          <button className="perm-delete-btn" onClick={() => handlePermanentDelete(img.id)}>Delete</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-images-text">Trash is empty.</p>
                  )}
                </div>
              )}

              <button className="logout-btn" onClick={() => setIsLoggedIn(false)}>
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className="footer-copyright">
        All Rights Reserved © 2026 - Photo Vault System
      </footer>
    </div>
  );
}

export default App;
