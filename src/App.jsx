import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';
import { auth } from './firebase';
import './App.css';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPass, setIsForgotPass] = useState(false);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

  // حالات الخزنة المتقدمة
  const [images, setImages] = useState([]);
  const [trash, setTrash] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentView, setCurrentView] = useState('gallery');

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      if (isForgotPass) {
        await sendPasswordResetEmail(auth, identifier);
        setMessage('تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.');
        return;
      }

      if (isRegistering) {
        if (password !== confirmPassword) {
          setError('كلمتا المرور غير متطابقتان. الرجاء التأكد منهما.');
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, identifier, password);
        setUser(userCredential.user);
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, identifier, password);
      setUser(userCredential.user);

    } catch (err) {
      setError('حدث خطأ، يرجى التأكد من البيانات المدخلة.');
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file),
      category: selectedCategory === 'All' ? 'General' : selectedCategory
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const moveToTrash = (id) => {
    const imageToDelete = images.find(img => img.id === id);
    if (imageToDelete) {
      setImages(prev => prev.filter(img => img.id !== id));
      setTrash(prev => [...prev, imageToDelete]);
    }
  };

  const restoreFromTrash = (id) => {
    const imageToRestore = trash.find(img => img.id === id);
    if (imageToRestore) {
      setTrash(prev => prev.filter(img => img.id !== id));
      setImages(prev => [...prev, imageToRestore]);
    }
  };

  const deletePermanently = (id) => {
    setTrash(prev => prev.filter(img => img.id !== id));
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setImages([]);
    setTrash([]);
  };

  const filteredImages = selectedCategory === 'All' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  return (
    <div className={`app-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="top-bar-settings">
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          {isDarkMode ? 'Light Mode ☀️' : 'Dark Mode 🌙'}
        </button>
      </div>

      <div className={`main-layout ${user ? 'expanded-layout' : ''}`}>
        {/* القسم العلوي (الشعار والنص الترويجي يبقى ظاهراً في الحالتين كما طلبت) */}
        <div className="hero-section">
          <div className="logo-area">
            <span className="logo-text">SecretSpace</span>
            <span className="logo-icon">🔒</span>
          </div>
          <h1>Your space. Your media. <span className="highlight-text">Your privacy</span></h1>
          <p>Secure storage for your private photos and videos with absolute safety</p>
        </div>

        <div className={`login-card ${user ? 'vault-card-wide' : ''}`}>
          {user ? (
            /* --- شاشة الخزنة الموسعة --- */
            <div className="vault-container">
              <div className="vault-header">
                <h2>Your Secure Vault</h2>
                <p className="vault-user-email">Logged in as: {user.email}</p>
              </div>

              <div className="vault-nav-tabs">
                <button 
                  className={`tab-btn ${currentView === 'gallery' ? 'active' : ''}`}
                  onClick={() => setCurrentView('gallery')}
                >
                  📁 Gallery
                </button>
                <button 
                  className={`tab-btn ${currentView === 'trash' ? 'active' : ''}`}
                  onClick={() => setCurrentView('trash')}
                >
                  🗑️ Trash ({trash.length})
                </button>
              </div>

              {currentView === 'gallery' ? (
                <>
                  <div className="categories-bar">
                    {['All', 'Family', 'Work', 'Personal', 'General'].map(cat => (
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
                    <label htmlFor="file-upload" className="upload-btn">
                      ➕ Upload to [{selectedCategory}]
                    </label>
                    <input 
                      id="file-upload" 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      style={{ display: 'none' }}
                    />
                  </div>

                  <div className="gallery-grid-full">
                    {filteredImages.length === 0 ? (
                      <p className="no-images-text">No media in this category yet. Upload your private photos!</p>
                    ) : (
                      filteredImages.map(img => (
                        <div key={img.id} className="image-card-full">
                          <img src={img.url} alt="Vault item" />
                          <span className="img-badge">{img.category}</span>
                          <button className="delete-icon-btn" onClick={() => moveToTrash(img.id)} title="Delete">❌</button>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="trash-section">
                  <h3>Recycle Bin</h3>
                  <div className="gallery-grid-full">
                    {trash.length === 0 ? (
                      <p className="no-images-text">Trash is empty.</p>
                    ) : (
                      trash.map(img => (
                        <div key={img.id} className="image-card-full trash-item">
                          <img src={img.url} alt="Deleted item" />
                          <div className="trash-actions">
                            <button onClick={() => restoreFromTrash(img.id)} className="restore-btn">Restore</button>
                            <button onClick={() => deletePermanently(img.id)} className="perm-delete-btn">Delete</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <button onClick={handleLogout} className="logout-btn">
                Sign Out
              </button>
            </div>
          ) : (
            /* --- شاشة تسجيل الدخول العادية --- */
            <>
              <div className="login-header">
                <h2>
                  {isForgotPass ? 'Reset Password' : isRegistering ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p>
                  {isForgotPass 
                    ? 'Enter your email to reset password' 
                    : isRegistering 
                    ? 'Sign up for a new account' 
                    : 'Sign in to access your private space'}
                </p>
              </div>

              <form className="login-form" onSubmit={handleSubmit}>
                {error && <p className="error-text">{error}</p>}
                {message && <p className="success-text">{message}</p>}

                <div className="input-group">
                  <label>Email or Phone Number</label>
                  <div className="input-wrapper">
                    <span className="icon">👤</span>
                    <input 
                      type="text" 
                      placeholder="Enter email or phone" 
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {!isForgotPass && (
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
                    {!isRegistering && (
                      <span 
                        className="link-text forgot-link-inline" 
                        onClick={() => { setIsForgotPass(true); setError(''); }}
                      >
                        Forgot Password?
                      </span>
                    )}
                  </div>
                )}

                {isRegistering && (
                  <div className="input-group">
                    <label>Confirm Password</label>
                    <div className="input-wrapper">
                      <span className="icon">🔒</span>
                      <input 
                        type="password" 
                        placeholder="••••••••••••" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <button type="submit" className="login-btn">
                  {isForgotPass ? 'Send Reset Link' : isRegistering ? 'Sign Up' : 'Login to Vault'}
                </button>

                <div className="form-actions-bottom">
                  {!isForgotPass ? (
                    <span 
                      className="link-text" 
                      onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                    >
                      {isRegistering ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                    </span>
                  ) : (
                    <span 
                      className="link-text" 
                      onClick={() => { setIsForgotPass(false); setError(''); }}
                    >
                      Back to Login
                    </span>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      <footer className="footer-copyright">
        ©SecretSpace. All rights reserved 2026
      </footer>
    </div>
  );
}
