import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [theme, setTheme] = useState('light');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login', 'signup', 'forgot'
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Active Main Tab: 'gallery', 'trash', 'profile', 'analytics', 'security', 'favorites'
  const [activeTab, setActiveTab] = useState('gallery'); 
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Load images, trash, profile & security settings from LocalStorage
  const [images, setImages] = useState(() => {
    try {
      const saved = localStorage.getItem('vault_images');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [trash, setTrash] = useState(() => {
    try {
      const saved = localStorage.getItem('vault_trash');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('vault_profile');
      return saved ? JSON.parse(saved) : { name: 'Vault User', phone: '', bio: 'Securing private moments.' };
    } catch { return { name: 'Vault User', phone: '', bio: 'Securing private moments.' }; }
  });

  const [securitySettings, setSecuritySettings] = useState(() => {
    try {
      const saved = localStorage.getItem('vault_security');
      return saved ? JSON.parse(saved) : { pin: '1234', twoFactor: false };
    } catch { return { pin: '1234', twoFactor: false }; }
  });

  // Save states automatically
  useEffect(() => {
    localStorage.setItem('vault_images', JSON.stringify(images));
  }, [images]);

  useEffect(() => {
    localStorage.setItem('vault_trash', JSON.stringify(trash));
  }, [trash]);

  useEffect(() => {
    localStorage.setItem('vault_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('vault_security', JSON.stringify(securitySettings));
  }, [securitySettings]);

  // Upload preview states
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Nature');

  // Confirmation Modal state for permanent delete
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      setErrorMsg('Please enter email/phone and password');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsLoggedIn(true);
      setUserProfile(prev => ({ ...prev, name: identifier }));
    }, 800);
  };

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
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg('Account created successfully! Please sign in.');
      setTimeout(() => {
        setAuthMode('login');
        setSuccessMsg('');
      }, 1200);
    }, 800);
  };

  const handleForgot = (e) => {
    e.preventDefault();
    if (!identifier) {
      setErrorMsg('Please enter your email or phone number');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg('Password reset instructions sent to your identifier.');
    }, 800);
  };

  // Convert image to Base64 so it persists on Refresh
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveImage = (e) => {
    e.preventDefault();
    if (!previewUrl) return;

    const newImg = {
      id: Date.now(),
      url: previewUrl,
      category: uploadCategory,
      isFavorite: false,
      date: new Date().toLocaleDateString()
    };

    setImages([newImg, ...images]);
    setPreviewUrl('');
    setUploadCategory('Nature');
  };

  const handleCancelUpload = () => {
    setPreviewUrl('');
    setUploadCategory('Nature');
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
    setDeleteConfirmId(null);
  };

  const handleToggleFavorite = (id) => {
    setImages(images.map(img => img.id === id ? { ...img, isFavorite: !img.isFavorite } : img));
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const filteredImages = selectedCategory === 'All' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  const favoriteImages = images.filter(img => img.isFavorite);

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
              
              {/* Sign In Form */}
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

                    <button type="submit" className="login-btn" disabled={isLoading}>
                      {isLoading ? 'Authenticating...' : 'Enter Vault'}
                    </button>

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

              {/* Sign Up Form */}
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

                    <button type="submit" className="login-btn" disabled={isLoading}>
                      {isLoading ? 'Creating Account...' : 'Register'}
                    </button>

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

              {/* Forgot Password Form */}
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

                    <button type="submit" className="login-btn" disabled={isLoading}>
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <p className="vault-user-email">Account: {userProfile.name}</p>
                  <span style={{ fontSize: '11px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '3px 8px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                    📊 Stored: {images.length}
                  </span>
                </div>
              </div>

              {/* Navigation Tabs including the 4 New Screens */}
              <div className="vault-nav-tabs" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                <button 
                  className={`tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
                  onClick={() => setActiveTab('gallery')}
                >
                  📁 Gallery
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
                  onClick={() => setActiveTab('favorites')}
                >
                  ⭐ Favorites ({favoriteImages.length})
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'trash' ? 'active' : ''}`}
                  onClick={() => setActiveTab('trash')}
                >
                  🗑️ Trash
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  👤 Profile
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                  onClick={() => setActiveTab('analytics')}
                >
                  📈 Analytics
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                  onClick={() => setActiveTab('security')}
                >
                  🛡️ Security
                </button>
              </div>

              {/* 1. GALLERY SCREEN */}
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
                      ➕ Select Image to Upload
                      <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                    </label>
                  </div>

                  {previewUrl && (
                    <div className="preview-container animate-fade" style={{ background: 'rgba(0,0,0,0.35)', padding: '15px', borderRadius: '16px', textAlign: 'center', margin: '10px 0', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                      <p style={{ fontSize: '13px', marginBottom: '8px', color: '#38bdf8', fontWeight: '600' }}>Image Preview</p>
                      <img src={previewUrl} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '10px', marginBottom: '10px', border: '1px solid #38bdf8' }} />
                      
                      <div className="input-group" style={{ marginBottom: '10px' }}>
                        <label>Select Category for this Image</label>
                        <select 
                          value={uploadCategory} 
                          onChange={(e) => setUploadCategory(e.target.value)}
                          style={{ width: '100%', padding: '8px', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', outline: 'none' }}
                        >
                          <option value="Nature">Nature</option>
                          <option value="Scenery">Scenery</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleSaveImage} className="login-btn" style={{ flex: 1, marginTop: '0', background: '#22c55e' }}>Save</button>
                        <button onClick={handleCancelUpload} className="login-btn" style={{ flex: 1, marginTop: '0', background: '#ef4444' }}>Cancel</button>
                      </div>
                    </div>
                  )}

                  <div className="gallery-grid-full">
                    {filteredImages.length > 0 ? (
                      filteredImages.map(img => (
                        <div key={img.id} className="image-card-full">
                          <img src={img.url} alt="Vault item" />
                          <span className="img-badge">{img.category}</span>
                          <button 
                            style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontSize: '14px' }}
                            onClick={() => handleToggleFavorite(img.id)}
                            title="Favorite"
                          >
                            {img.isFavorite ? '⭐' : '☆'}
                          </button>
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
                      <p className="no-images-text">No images added in this section yet. Select and save your first image!</p>
                    )}
                  </div>
                </>
              )}

              {/* 2. FAVORITES SCREEN */}
              {activeTab === 'favorites' && (
                <div className="gallery-grid-full" style={{ marginTop: '15px' }}>
                  {favoriteImages.length > 0 ? (
                    favoriteImages.map(img => (
                      <div key={img.id} className="image-card-full">
                        <img src={img.url} alt="Favorite item" />
                        <span className="img-badge">{img.category}</span>
                        <button 
                          style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontSize: '14px' }}
                          onClick={() => handleToggleFavorite(img.id)}
                        >
                          ⭐
                        </button>
                        <button 
                          className="delete-icon-btn"
                          onClick={() => handleDeleteImage(img.id)}
                        >
                          ❌
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="no-images-text">No favorite images selected yet.</p>
                  )}
                </div>
              )}

              {/* 3. TRASH SCREEN */}
              {activeTab === 'trash' && (
                <div className="gallery-grid-full" style={{ marginTop: '15px' }}>
                  {trash.length > 0 ? (
                    trash.map(img => (
                      <div key={img.id} className="image-card-full">
                        <img src={img.url} alt="Deleted item" style={{ opacity: 0.6 }} />
                        <div className="trash-actions">
                          <button className="restore-btn" onClick={() => handleRestoreImage(img.id)}>Restore</button>
                          <button className="perm-delete-btn" onClick={() => setDeleteConfirmId(img.id)}>Delete</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-images-text">Trash is empty.</p>
                  )}
                </div>
              )}

              {/* 4. PROFILE SCREEN (NEW) */}
              {activeTab === 'profile' && (
                <div className="animate-fade" style={{ padding: '15px 0' }}>
                  <h3 style={{ color: '#38bdf8', marginBottom: '15px' }}>User Profile Settings</h3>
                  <div className="input-group">
                    <label>Display Name</label>
                    <div className="input-wrapper">
                      <span className="icon">👤</span>
                      <input 
                        type="text" 
                        value={userProfile.name}
                        onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Bio / Description</label>
                    <div className="input-wrapper">
                      <span className="icon">📝</span>
                      <input 
                        type="text" 
                        value={userProfile.bio}
                        onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })}
                      />
                    </div>
                  </div>
                  <p style={{ fontSize: '12px', color: '#22c55e', marginTop: '10px' }}>✓ Profile details updated automatically.</p>
                </div>
              )}

              {/* 5. ANALYTICS SCREEN (NEW) */}
              {activeTab === 'analytics' && (
                <div className="animate-fade" style={{ padding: '15px 0', textAlign: 'left' }}>
                  <h3 style={{ color: '#38bdf8', marginBottom: '15px' }}>Vault Analytics & Storage</h3>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px', marginBottom: '10px' }}>
                    <p style={{ fontSize: '14px', marginBottom: '8px' }}>📁 Total Stored Images: <b>{images.length}</b></p>
                    <p style={{ fontSize: '14px', marginBottom: '8px' }}>🌲 Nature Category: <b>{images.filter(i => i.category === 'Nature').length}</b></p>
                    <p style={{ fontSize: '14px', marginBottom: '8px' }}>🌄 Scenery Category: <b>{images.filter(i => i.category === 'Scenery').length}</b></p>
                    <p style={{ fontSize: '14px' }}>🗑️ Items in Trash: <b>{trash.length}</b></p>
                  </div>
                </div>
              )}

              {/* 6. SECURITY SETTINGS SCREEN (NEW) */}
              {activeTab === 'security' && (
                <div className="animate-fade" style={{ padding: '15px 0', textAlign: 'left' }}>
                  <h3 style={{ color: '#38bdf8', marginBottom: '15px' }}>Security Configuration</h3>
                  <div className="input-group">
                    <label>Vault Security PIN</label>
                    <div className="input-wrapper">
                      <span className="icon">🔐</span>
                      <input 
                        type="password" 
                        value={securitySettings.pin}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, pin: e.target.value })}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
                    <input 
                      type="checkbox" 
                      id="2fa"
                      checked={securitySettings.twoFactor}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactor: e.target.checked })}
                    />
                    <label htmlFor="2fa" style={{ fontSize: '13px', cursor: 'pointer' }}>Enable Two-Factor Authentication (2FA)</label>
                  </div>
                </div>
              )}

              {/* Confirmation Modal for Permanent Delete */}
              {deleteConfirmId && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                  <div style={{ background: '#1e293b', padding: '25px', borderRadius: '16px', textAlign: 'center', maxWidth: '320px', width: '90%', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                    <h3 style={{ color: '#f87171', marginBottom: '10px' }}>Confirm Permanent Deletion</h3>
                    <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>Are you sure you want to permanently delete this photo? This action cannot be undone.</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handlePermanentDelete(deleteConfirmId)} className="login-btn" style={{ flex: 1, marginTop: 0, background: '#ef4444' }}>Yes, Delete</button>
                      <button onClick={() => setDeleteConfirmId(null)} className="login-btn" style={{ flex: 1, marginTop: 0, background: '#64748b' }}>Cancel</button>
                    </div>
                  </div>
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
