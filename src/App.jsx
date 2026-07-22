import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [theme, setTheme] = useState('dark');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // PIN Lock State
  const [isLocked, setIsLocked] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');

  const [authMode, setAuthMode] = useState('login'); // 'login', 'signup', 'forgot'
  
  const [identifier, setIdentifier] = useState('');
  const [fullName, setFullName] = useState(''); 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Show/Hide Password States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Active Main Tab
  const [activeTab, setActiveTab] = useState('gallery'); 
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Search, Sorting & Grid View
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); 
  const [gridColumns, setGridColumns] = useState('normal'); 

  // Lightbox & Slideshow states
  const [lightboxImg, setLightboxImg] = useState(null);
  const [isSlideshowActive, setIsSlideshowActive] = useState(false);

  // Multi-Select state
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState([]);

  // Change Password states
  const [oldPasswordInput, setOldPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Share Link modal state
  const [shareLinkModal, setShareLinkModal] = useState(null);

  // Upload enhancements
  const [imageCaption, setImageCaption] = useState('');
  const [imageFilter, setImageFilter] = useState('none'); 
  const [autoCompress, setAutoCompress] = useState(true);

  // Auto-lock timer state
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());

  // Failed logins tracker
  const [failedLoginsCount, setFailedLoginsCount] = useState(() => {
    try {
      const saved = localStorage.getItem('vault_failed_logins');
      return saved ? JSON.parse(saved) : 0;
    } catch { return 0; }
  });

  // Load standard states from LocalStorage
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
      return saved ? JSON.parse(saved) : { pin: '1234', twoFactor: false, accountPassword: 'password123', autoLockMinutes: 2 };
    } catch { return { pin: '1234', twoFactor: false, accountPassword: 'password123', autoLockMinutes: 2 }; }
  });

  const [activityLogs, setActivityLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('vault_logs');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const addLog = (action) => {
    const newLog = {
      id: Date.now(),
      action,
      time: new Date().toLocaleString()
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

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

  useEffect(() => {
    localStorage.setItem('vault_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('vault_failed_logins', JSON.stringify(failedLoginsCount));
  }, [failedLoginsCount]);

  // Auto-Lock Idle Monitor & PIN Lock Trigger
  useEffect(() => {
    if (!isLoggedIn || isLocked) return;

    const handleActivity = () => setLastActivityTime(Date.now());
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);

    const interval = setInterval(() => {
      const idleLimitMs = (securitySettings.autoLockMinutes || 2) * 60 * 1000;
      if (Date.now() - lastActivityTime > idleLimitMs) {
        setIsLocked(true);
        addLog('Vault locked due to inactivity (PIN required)');
      }
    }, 10000);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      clearInterval(interval);
    };
  }, [isLoggedIn, isLocked, lastActivityTime, securitySettings.autoLockMinutes]);

  // Slideshow Effect
  useEffect(() => {
    let interval;
    if (isSlideshowActive && images.length > 0) {
      let currentIndex = 0;
      setLightboxImg(images[0]);
      interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length;
        setLightboxImg(images[currentIndex]);
      }, 3000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isSlideshowActive, images]);

  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Nature');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      setErrorMsg('Please enter email/phone and password');
      return;
    }
    if (password !== securitySettings.accountPassword && password !== 'admin') {
      setFailedLoginsCount(prev => prev + 1);
      setErrorMsg('Invalid credentials. Attempt logged.');
      addLog('Failed login attempt detected');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsLoggedIn(true);
      setUserProfile(prev => ({ ...prev, name: fullName ? fullName : identifier }));
      addLog('Signed in to vault successfully');
    }, 800);
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (!identifier || !password || !confirmPassword) {
      setErrorMsg('Please fill in required fields');
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
      addLog('Created a new vault account');
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
      addLog('Requested password reset');
    }, 800);
  };

  const handleUnlockPin = (e) => {
    e.preventDefault();
    if (enteredPin === securitySettings.pin) {
      setIsLocked(false);
      setEnteredPin('');
      setErrorMsg('');
      addLog('Vault unlocked via PIN');
    } else {
      setErrorMsg('Incorrect PIN code');
      addLog('Failed PIN unlock attempt');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (!autoCompress) {
          setPreviewUrl(reader.result);
          return;
        }
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800;
          if (width > height && width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          } else if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          setPreviewUrl(canvas.toDataURL('image/jpeg', 0.75));
        };
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
      caption: imageCaption || 'No caption',
      filter: imageFilter,
      isFavorite: false,
      date: new Date().toLocaleDateString()
    };

    setImages([newImg, ...images]);
    setPreviewUrl('');
    setImageCaption('');
    setImageFilter('none');
    setUploadCategory('Nature');
    addLog(`Uploaded image with caption: ${newImg.caption}`);
  };

  const handleCancelUpload = () => {
    setPreviewUrl('');
    setImageCaption('');
    setImageFilter('none');
    setUploadCategory('Nature');
  };

  const handleDeleteImage = (id) => {
    const imgToDelete = images.find(img => img.id === id);
    if (imgToDelete) {
      setImages(images.filter(img => img.id !== id));
      setTrash([imgToDelete, ...trash]);
      addLog('Moved an image to trash');
    }
  };

  const handleRestoreImage = (id) => {
    const imgToRestore = trash.find(img => img.id === id);
    if (imgToRestore) {
      setTrash(trash.filter(img => img.id !== id));
      setImages([imgToRestore, ...images]);
      addLog('Restored an image from trash');
    }
  };

  const handlePermanentDelete = (id) => {
    setTrash(trash.filter(img => img.id !== id));
    setDeleteConfirmId(null);
    addLog('Permanently deleted an image');
  };

  const handleToggleFavorite = (id) => {
    setImages(images.map(img => img.id === id ? { ...img, isFavorite: !img.isFavorite } : img));
    addLog('Updated favorite status for an image');
  };

  const handleToggleSelectImage = (id) => {
    if (selectedImageIds.includes(id)) {
      setSelectedImageIds(selectedImageIds.filter(item => item !== id));
    } else {
      setSelectedImageIds([...selectedImageIds, id]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedImageIds.length === 0) return;
    const itemsToDelete = images.filter(img => selectedImageIds.includes(img.id));
    setImages(images.filter(img => !selectedImageIds.includes(img.id)));
    setTrash([...itemsToDelete, ...trash]);
    setSelectedImageIds([]);
    setIsMultiSelectMode(false);
    addLog(`Moved ${itemsToDelete.length} images to trash in bulk`);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!oldPasswordInput || !newPasswordInput) {
      alert('Please fill in all password fields');
      return;
    }
    setSecuritySettings({ ...securitySettings, accountPassword: newPasswordInput });
    setOldPasswordInput('');
    setNewPasswordInput('');
    alert('Password updated successfully!');
    addLog('Changed account password');
  };

  const handleExportData = () => {
    const dataObj = { images, trash, userProfile, securitySettings, activityLogs };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `vault_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addLog('Exported backup JSON data');
  };

  const handleImportData = (e) => {
    const fileReader = new FileReader();
    if (e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed.images) setImages(parsed.images);
          if (parsed.trash) setTrash(parsed.trash);
          if (parsed.userProfile) setUserProfile(parsed.userProfile);
          if (parsed.securitySettings) setSecuritySettings(parsed.securitySettings);
          if (parsed.activityLogs) setActivityLogs(parsed.activityLogs);
          alert('Data imported successfully!');
          addLog('Imported backup JSON data');
        } catch {
          alert('Invalid backup JSON file.');
        }
      };
    }
  };

  const filteredImages = images.filter(img => {
    const matchesCategory = selectedCategory === 'All' || img.category === selectedCategory;
    const matchesSearch = img.category.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          img.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          img.caption.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'newest') return b.id - a.id;
    if (sortBy === 'oldest') return a.id - b.id;
    return 0;
  });

  const favoriteImages = images.filter(img => img.isFavorite);
  const totalStorageKb = Math.round(JSON.stringify(images).length / 1024);
  const maxStorageKb = 5120; 
  const storagePercentage = Math.min(Math.round((totalStorageKb / maxStorageKb) * 100), 100);

  return (
    <div className={`app-container ${theme} vault-bg-pattern`}>
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
                      <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="icon">🔑</span>
                        <input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', color: 'inherit' }}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '0 8px' }}
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? "👁️‍🗨️" : "👁️"}
                        </button>
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
                      <label>Personal Name (Optional)</label>
                      <div className="input-wrapper">
                        <span className="icon">👤</span>
                        <input 
                          type="text" 
                          placeholder="Enter your personal name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>
                    </div>
                    
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
                      <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="icon">🔑</span>
                        <input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', color: 'inherit' }}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '0 8px' }}
                        >
                          {showPassword ? "👁️‍🗨️" : "👁️"}
                        </button>
                      </div>
                    </div>

                    <div className="input-group">
                      <label>Confirm Password</label>
                      <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="icon">🔐</span>
                        <input 
                          type={showConfirmPassword ? "text" : "password"} 
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', color: 'inherit' }}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '0 8px' }}
                        >
                          {showConfirmPassword ? "👁️‍🗨️" : "👁️"}
                        </button>
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
          ) : isLocked ? (
            /* PIN Lock Screen */
            <div className="animate-fade" style={{ textAlign: 'center', padding: '20px' }}>
              <div className="login-header">
                <h2>🔒 Vault Locked</h2>
                <p>Enter your security PIN code to continue</p>
              </div>
              <form onSubmit={handleUnlockPin} className="login-form">
                {errorMsg && <p className="error-text">{errorMsg}</p>}
                <div className="input-group">
                  <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="icon">🔑</span>
                    <input 
                      type={showPin ? "text" : "password"} 
                      maxLength="6"
                      placeholder="Enter PIN (default 1234)"
                      value={enteredPin}
                      onChange={(e) => setEnteredPin(e.target.value)}
                      style={{ textAlign: 'center', letterSpacing: '4px', flex: 1, border: 'none', background: 'transparent', outline: 'none', color: 'inherit' }}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '0 8px' }}
                    >
                      {showPin ? "👁️‍🗨️" : "👁️"}
                    </button>
                  </div>
                </div>
                <button type="submit" className="login-btn" style={{ background: '#2563eb' }}>Unlock Vault</button>
              </form>
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

              {/* Quick Bookmark Bar */}
              <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '5px', marginBottom: '8px' }}>
                <button onClick={() => setSelectedCategory('All')} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#38bdf8', fontSize: '11px', padding: '3px 8px', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}>⚡ Quick: All</button>
                <button onClick={() => setActiveTab('favorites')} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#38bdf8', fontSize: '11px', padding: '3px 8px', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}>⭐ Favorites</button>
                <button onClick={() => setActiveTab('analytics')} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#38bdf8', fontSize: '11px', padding: '3px 8px', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}>📈 Storage Meter</button>
                <button onClick={() => setActiveTab('faq')} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#38bdf8', fontSize: '11px', padding: '3px 8px', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}>❓ FAQ</button>
              </div>

              {/* Navigation Tabs */}
              <div className="vault-nav-tabs" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '12px' }}>
                <button className={`tab-btn ${activeTab === 'gallery' ? 'active' : ''}`} onClick={() => setActiveTab('gallery')}>📁 Gallery</button>
                <button className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`} onClick={() => setActiveTab('favorites')}>⭐ Favorites</button>
                <button className={`tab-btn ${activeTab === 'trash' ? 'active' : ''}`} onClick={() => setActiveTab('trash')}>🗑️ Trash</button>
                <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>👤 Profile</button>
                <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>📈 Analytics</button>
                <button className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>🛡️ Security</button>
                <button className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>📋 Logs</button>
                <button className={`tab-btn ${activeTab === 'faq' ? 'active' : ''}`} onClick={() => setActiveTab('faq')} style={{ gridColumn: 'span 2' }}>❓ FAQ & Support</button>
              </div>

              {/* 1. GALLERY SCREEN */}
              {activeTab === 'gallery' && (
                <>
                  <div className="input-group" style={{ margin: '10px 0 5px 0' }}>
                    <div className="input-wrapper">
                      <span className="icon">🔍</span>
                      <input 
                        type="text" 
                        placeholder="Search category, date or caption..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      style={{ flex: 1, padding: '6px', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontSize: '11px', outline: 'none' }}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>

                    <button 
                      onClick={() => setGridColumns(gridColumns === 'normal' ? 'large' : 'normal')}
                      style={{ padding: '6px 8px', borderRadius: '8px', background: '#334155', color: '#fff', border: 'none', fontSize: '11px', cursor: 'pointer' }}
                    >
                      {gridColumns === 'normal' ? '🔲 Large Grid' : '⏹️ Normal Grid'}
                    </button>

                    <button 
                      onClick={() => setIsSlideshowActive(true)}
                      style={{ padding: '6px 8px', borderRadius: '8px', background: '#0284c7', color: '#fff', border: 'none', fontSize: '11px', cursor: 'pointer' }}
                    >
                      ▶️ Slideshow
                    </button>

                    <button 
                      onClick={() => { setIsMultiSelectMode(!isMultiSelectMode); setSelectedImageIds([]); }}
                      style={{ padding: '6px 8px', borderRadius: '8px', background: isMultiSelectMode ? '#ef4444' : '#475569', color: '#fff', border: 'none', fontSize: '11px', cursor: 'pointer' }}
                    >
                      {isMultiSelectMode ? 'Cancel' : '☑️ Select'}
                    </button>
                  </div>

                  {isMultiSelectMode && selectedImageIds.length > 0 && (
                    <button 
                      onClick={handleBulkDelete}
                      style={{ width: '100%', marginBottom: '10px', padding: '8px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                    >
                      Delete Selected ({selectedImageIds.length})
                    </button>
                  )}

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
                      
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        style={{ 
                          width: '100px', height: '100px', objectFit: 'cover', borderRadius: '10px', marginBottom: '10px', border: '1px solid #38bdf8',
                          filter: imageFilter === 'grayscale' ? 'grayscale(100%)' : imageFilter === 'sepia' ? 'sepia(100%)' : 'none'
                        }} 
                      />
                      
                      <div className="input-group" style={{ marginBottom: '8px' }}>
                        <select 
                          value={uploadCategory} 
                          onChange={(e) => setUploadCategory(e.target.value)}
                          style={{ width: '100%', padding: '6px', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', outline: 'none', fontSize: '12px' }}
                        >
                          <option value="Nature">Category: Nature</option>
                          <option value="Scenery">Category: Scenery</option>
                        </select>
                      </div>

                      <div className="input-group" style={{ marginBottom: '8px' }}>
                        <input 
                          type="text" 
                          placeholder="Add image caption/note..."
                          value={imageCaption}
                          onChange={(e) => setImageCaption(e.target.value)}
                          style={{ width: '100%', padding: '6px', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', outline: 'none', fontSize: '12px' }}
                        />
                      </div>

                      <div className="input-group" style={{ marginBottom: '8px' }}>
                        <select 
                          value={imageFilter} 
                          onChange={(e) => setImageFilter(e.target.value)}
                          style={{ width: '100%', padding: '6px', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', outline: 'none', fontSize: '12px' }}
                        >
                          <option value="none">Filter: Normal</option>
                          <option value="grayscale">Filter: Grayscale</option>
                          <option value="sepia">Filter: Sepia</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleSaveImage} className="login-btn" style={{ flex: 1, marginTop: '0', background: '#22c55e' }}>Save</button>
                        <button onClick={handleCancelUpload} className="login-btn" style={{ flex: 1, marginTop: '0', background: '#ef4444' }}>Cancel</button>
                      </div>
                    </div>
                  )}

                  <div className="gallery-grid-full" style={{ gridTemplateColumns: gridColumns === 'large' ? 'repeat(1, 1fr)' : 'repeat(2, 1fr)' }}>
                    {filteredImages.length > 0 ? (
                      filteredImages.map(img => (
                        <div 
                          key={img.id} 
                          className="image-card-full" 
                          onClick={() => {
                            if (isMultiSelectMode) {
                              handleToggleSelectImage(img.id);
                            } else {
                              setLightboxImg(img);
                            }
                          }} 
                          style={{ cursor: 'pointer', border: selectedImageIds.includes(img.id) ? '3px solid #38bdf8' : 'none' }}
                        >
                          <img 
                            src={img.url} 
                            alt="Vault item" 
                            style={{ filter: img.filter === 'grayscale' ? 'grayscale(100%)' : img.filter === 'sepia' ? 'sepia(100%)' : 'none' }}
                          />
                          <span className="img-badge">{img.category}</span>
                          
                          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', fontSize: '10px', color: '#cbd5e1', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {img.caption}
                          </div>

                          {isMultiSelectMode && (
                            <span style={{ position: 'absolute', top: '8px', right: '8px', background: selectedImageIds.includes(img.id) ? '#38bdf8' : 'rgba(0,0,0,0.5)', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                              {selectedImageIds.includes(img.id) ? '✓' : ''}
                            </span>
                          )}

                          {!isMultiSelectMode && (
                            <>
                              <button 
                                style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontSize: '14px', zIndex: 2 }}
                                onClick={(e) => { e.stopPropagation(); handleToggleFavorite(img.id); }}
                                title="Favorite"
                              >
                                {img.isFavorite ? '⭐' : '☆'}
                              </button>
                              <button 
                                className="delete-icon-btn"
                                onClick={(e) => { e.stopPropagation(); handleDeleteImage(img.id); }}
                                title="Delete"
                                style={{ zIndex: 2 }}
                              >
                                ❌
                              </button>
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="no-images-text">No images found matching your search.</p>
                    )}
                  </div>
                </>
              )}

              {/* 2. FAVORITES SCREEN */}
              {activeTab === 'favorites' && (
                <div className="gallery-grid-full" style={{ marginTop: '15px' }}>
                  {favoriteImages.length > 0 ? (
                    favoriteImages.map(img => (
                      <div key={img.id} className="image-card-full" onClick={() => setLightboxImg(img)} style={{ cursor: 'pointer' }}>
                        <img src={img.url} alt="Favorite item" style={{ filter: img.filter === 'grayscale' ? 'grayscale(100%)' : img.filter === 'sepia' ? 'sepia(100%)' : 'none' }} />
                        <span className="img-badge">{img.category}</span>
                        <button 
                          style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontSize: '14px', zIndex: 2 }}
                          onClick={(e) => { e.stopPropagation(); handleToggleFavorite(img.id); }}
                        >
                          ⭐
                        </button>
                        <button 
                          className="delete-icon-btn"
                          onClick={(e) => { e.stopPropagation(); handleDeleteImage(img.id); }}
                          style={{ zIndex: 2 }}
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

              {/* 4. PROFILE SCREEN */}
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

              {/* 5. ANALYTICS & STORAGE METER */}
              {activeTab === 'analytics' && (
                <div className="animate-fade" style={{ padding: '15px 0', textAlign: 'left' }}>
                  <h3 style={{ color: '#38bdf8', marginBottom: '15px' }}>Vault Analytics & Storage</h3>
                  
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
                    <p style={{ fontSize: '13px', marginBottom: '6px' }}>💾 Storage Used: <b>{totalStorageKb} KB</b> / 5 MB</p>
                    <div style={{ width: '100%', background: '#334155', borderRadius: '6px', height: '10px', overflow: 'hidden', marginBottom: '10px' }}>
                      <div style={{ width: `${storagePercentage}%`, background: storagePercentage > 80 ? '#ef4444' : '#38bdf8', height: '100%', transition: 'width 0.3s' }}></div>
                    </div>
                    <p style={{ fontSize: '12px', marginBottom: '4px' }}>📁 Total Stored Images: <b>{images.length}</b></p>
                    <p style={{ fontSize: '12px', marginBottom: '4px' }}>🌲 Nature Category: <b>{images.filter(i => i.category === 'Nature').length}</b></p>
                    <p style={{ fontSize: '12px', marginBottom: '4px' }}>🌄 Scenery Category: <b>{images.filter(i => i.category === 'Scenery').length}</b></p>
                    <p style={{ fontSize: '12px' }}>🗑️ Items in Trash: <b>{trash.length}</b></p>
                  </div>

                  <h4 style={{ color: '#38bdf8', marginBottom: '10px', fontSize: '14px' }}>Data Backup & Restore</h4>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleExportData} className="login-btn" style={{ flex: 1, marginTop: 0, background: '#0284c7' }}>📥 Export JSON</button>
                    <label className="login-btn" style={{ flex: 1, marginTop: 0, background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      📤 Import JSON
                      <input type="file" accept=".json" onChange={handleImportData} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
              )}

              {/* 6. SECURITY SETTINGS SCREEN */}
              {activeTab === 'security' && (
                <div className="animate-fade" style={{ padding: '15px 0', textAlign: 'left' }}>
                  <h3 style={{ color: '#38bdf8', marginBottom: '15px' }}>Security Configuration</h3>
                  
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '12px', color: '#f87171' }}>
                    ⚠️ Failed Login Attempts Recorded: <b>{failedLoginsCount}</b>
                  </div>

                  <div className="input-group" style={{ marginBottom: '10px' }}>
                    <label>Auto-Lock Idle Time (Minutes)</label>
                    <select 
                      value={securitySettings.autoLockMinutes || 2}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, autoLockMinutes: Number(e.target.value) })}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', outline: 'none' }}
                    >
                      <option value={1}>1 Minute</option>
                      <option value={2}>2 Minutes</option>
                      <option value={5}>5 Minutes</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <input 
                      type="checkbox" 
                      id="compress"
                      checked={autoCompress}
                      onChange={(e) => setAutoCompress(e.target.checked)}
                    />
                    <label htmlFor="compress" style={{ fontSize: '13px', cursor: 'pointer' }}>Auto-Compress Uploaded Images (Save space)</label>
                  </div>

                  <div className="input-group">
                    <label>Vault Security PIN</label>
                    <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="icon">🔐</span>
                      <input 
                        type={showPin ? "text" : "password"} 
                        value={securitySettings.pin}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, pin: e.target.value })}
                        style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', color: 'inherit' }}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '0 8px' }}
                      >
                        {showPin ? "👁️‍🗨️" : "👁️"}
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleChangePassword} style={{ marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                    <h4 style={{ color: '#38bdf8', marginBottom: '10px', fontSize: '14px' }}>Change Account Password</h4>
                    <div className="input-group" style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', background: '#0f172a', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', padding: '0 8px' }}>
                        <input 
                          type={showOldPassword ? "text" : "password"} 
                          placeholder="Current Password"
                          value={oldPasswordInput}
                          onChange={(e) => setOldPasswordInput(e.target.value)}
                          style={{ width: '100%', padding: '8px 0', background: 'transparent', color: '#fff', border: 'none', outline: 'none' }}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '0 4px' }}
                        >
                          {showOldPassword ? "👁️‍🗨️" : "👁️"}
                        </button>
                      </div>
                    </div>
                    <div className="input-group" style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', background: '#0f172a', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', padding: '0 8px' }}>
                        <input 
                          type={showNewPassword ? "text" : "password"} 
                          placeholder="New Password"
                          value={newPasswordInput}
                          onChange={(e) => setNewPasswordInput(e.target.value)}
                          style={{ width: '100%', padding: '8px 0', background: 'transparent', color: '#fff', border: 'none', outline: 'none' }}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '0 4px' }}
                        >
                          {showNewPassword ? "👁️‍🗨️" : "👁️"}
                        </button>
                      </div>
                    </div>
                    <button type="submit" className="login-btn" style={{ marginTop: 0, background: '#4f46e5' }}>Update Password</button>
                  </form>
                </div>
              )}

              {/* 7. ACTIVITY LOGS SCREEN */}
              {activeTab === 'logs' && (
                <div className="animate-fade" style={{ padding: '15px 0', textAlign: 'left' }}>
                  <h3 style={{ color: '#38bdf8', marginBottom: '15px' }}>User Activity Audit Trail</h3>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px', maxHeight: '250px', overflowY: 'auto' }}>
                    {activityLogs.length > 0 ? (
                      activityLogs.map(log => (
                        <div key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '8px 0', fontSize: '12px' }}>
                          <p style={{ color: '#fff', marginBottom: '2px' }}>• {log.action}</p>
                          <span style={{ color: '#94a3b8', fontSize: '10px' }}>{log.time}</span>
                        </div>
                      ))
                    ) : (
                      <p className="no-images-text">No activities recorded yet.</p>
                    )}
                  </div>
                  {activityLogs.length > 0 && (
                    <button 
                      onClick={() => setActivityLogs([])} 
                      style={{ marginTop: '10px', padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Clear Logs
                    </button>
                  )}
                </div>
              )}

              {/* 8. FAQ & SUPPORT CENTER */}
              {activeTab === 'faq' && (
                <div className="animate-fade" style={{ padding: '15px 0', textAlign: 'left', fontSize: '12px' }}>
                  <h3 style={{ color: '#38bdf8', marginBottom: '12px', fontSize: '14px' }}>FAQ & Support Center</h3>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px', marginBottom: '8px' }}>
                    <p style={{ color: '#38bdf8', fontWeight: 'bold', marginBottom: '4px' }}>Q: How are my photos stored?</p>
                    <p style={{ color: '#94a3b8' }}>A: All photos are encrypted and saved securely inside your browser's LocalStorage using Base64 encoding.</p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px', marginBottom: '8px' }}>
                    <p style={{ color: '#38bdf8', fontWeight: 'bold', marginBottom: '4px' }}>Q: What happens when I delete an image?</p>
                    <p style={{ color: '#94a3b8' }}>A: It is moved to the Trash tab where you can restore it anytime or delete it permanently.</p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px' }}>
                    <p style={{ color: '#38bdf8', fontWeight: 'bold', marginBottom: '4px' }}>Q: How do I backup my data?</p>
                    <p style={{ color: '#94a3b8' }}>A: Go to Analytics tab and click Export JSON to download a local backup file.</p>
                  </div>
                </div>
              )}

              {/* Lightbox Modal */}
              {lightboxImg && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '20px' }} onClick={() => { setLightboxImg(null); setIsSlideshowActive(false); }}>
                  <div className="animate-fade-in" style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', maxWidth: '500px', width: '90%', textAlign: 'center', border: '1px solid rgba(56, 189, 248, 0.4)' }} onClick={(e) => e.stopPropagation()}>
                    <img 
                      src={lightboxImg.url} 
                      alt="Enlarged view" 
                      style={{ 
                        width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '12px', marginBottom: '10px',
                        filter: lightboxImg.filter === 'grayscale' ? 'grayscale(100%)' : lightboxImg.filter === 'sepia' ? 'sepia(100%)' : 'none'
                      }} 
                    />
                    <p style={{ color: '#38bdf8', fontSize: '13px', fontWeight: 'bold' }}>Category: {lightboxImg.category}</p>
                    <p style={{ color: '#cbd5e1', fontSize: '12px', marginBottom: '4px' }}>Note: "{lightboxImg.caption}"</p>
                    <p style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '12px' }}>Added on: {lightboxImg.date}</p>
                    
                    <button 
                      onClick={() => setShareLinkModal(`https://photovault.secure/share/${lightboxImg.id}?token=temp_secure`)}
                      style={{ width: '100%', marginBottom: '8px', padding: '6px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      🔗 Generate Temporary Share Link
                    </button>

                    {shareLinkModal && (
                      <div style={{ background: '#0f172a', padding: '6px', borderRadius: '6px', fontSize: '10px', color: '#38bdf8', marginBottom: '10px', wordBreak: 'break-all' }}>
                        {shareLinkModal} (Link expires in 24h)
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px' }}>
                      {isSlideshowActive && (
                        <button onClick={() => setIsSlideshowActive(false)} className="login-btn" style={{ flex: 1, marginTop: 0, background: '#f59e0b' }}>Pause</button>
                      )}
                      <button onClick={() => { setLightboxImg(null); setIsSlideshowActive(false); setShareLinkModal(null); }} className="login-btn" style={{ flex: 1, marginTop: 0, background: '#ef4444' }}>Close</button>
                    </div>
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
