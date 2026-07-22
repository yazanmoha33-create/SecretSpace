import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail 
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

  return (
    <div className={`app-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="top-bar-settings">
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          {isDarkMode ? 'Light Mode ☀️' : 'Dark Mode 🌙'}
        </button>
      </div>

      <div className="main-layout">
        <div className="hero-section">
          <div className="logo-area">
            <span className="logo-text">SecretSpace</span>
            <span className="logo-icon">🔒</span>
          </div>
          <h1>Your space. Your media. <span className="highlight-text">Your privacy</span></h1>
          <p>Secure storage for your private photos and videos with absolute safety</p>
        </div>

        <div className="login-card">
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

          {user ? (
            <div className="success-message" style={{ textAlign: 'center' }}>
              <h3>مرحباً بك، {user.email}!</h3>
              <p>تم تسجيل الدخول بنجاح إلى حسابك.</p>
            </div>
          ) : (
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
                  {/* رابط نسيت كلمة المرور أصبح تحت خانة إدخال الباسورد */}
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

              {/* رابط إنشاء وحساب جديد أصبح تحت زر الـ Login تماماً */}
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
          )}
        </div>
      </div>

      <footer className="footer-copyright">
        ©SecretSpace. All rights reserved 2026
      </footer>
    </div>
  );
}
