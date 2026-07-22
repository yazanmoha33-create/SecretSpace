import React, { useState } from 'react';
import './App.css';

function App() {
  // حالة الثيم (light / dark للخلفية العامة)
  const [theme, setTheme] = useState('light');
  
  // حالة تسجيل الدخول (نظام اسم المستخدم وكلمة المرور)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // تبويبات الخزنة الداخلية والمعرض
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' أو 'trash'
  const [selectedCategory, setSelectedCategory] = useState('الكل');

  // مصفوفة الصور التجريبية المضافة مع التصنيفات
  const [images, setImages] = useState([
    { id: 1, url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', category: 'طبيعة' },
    { id: 2, url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05', category: 'مناظر' },
    { id: 3, url: 'https://images.unsplash.com/photo-1426604966848-d7adacbd02bff', category: 'طبيعة' },
    { id: 4, url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba', category: 'مناظر' }
  ]);

  const [trash, setTrash] = useState([]);

  // معالجة تسجيل الدخول
  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim() === '' || password.trim() === '') {
      setLoginError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }
    setLoginError('');
    setIsLoggedIn(true);
  };

  // رفع صورة جديدة (تجريبي)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newImg = {
        id: Date.now(),
        url: URL.createObjectURL(file),
        category: selectedCategory === 'الكل' ? 'طبيعة' : selectedCategory
      };
      setImages([newImg, ...images]);
    }
  };

  // نقل إلى سلة المحذوفات
  const handleDeleteImage = (id) => {
    const imgToDelete = images.find(img => img.id === id);
    if (imgToDelete) {
      setImages(images.filter(img => img.id !== id));
      setTrash([imgToDelete, ...trash]);
    }
  };

  // استعادة من سلة المحذوفات
  const handleRestoreImage = (id) => {
    const imgToRestore = trash.find(img => img.id === id);
    if (imgToRestore) {
      setTrash(trash.filter(img => img.id !== id));
      setImages([imgToRestore, ...images]);
    }
  };

  // حذف نهائي
  const handlePermanentDelete = (id) => {
    setTrash(trash.filter(img => img.id !== id));
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const filteredImages = selectedCategory === 'الكل' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  return (
    <div className={`app-container ${theme}`}>
      {/* شريط الإعدادات العلوي */}
      <div className="top-bar-settings">
        <button onClick={toggleTheme} className="theme-toggle-btn">
          {theme === 'light' ? '🌙 الوضع الداكن' : '☀️ الوضع الفاتح'}
        </button>
      </div>

      <div className={`main-layout ${isLoggedIn ? 'expanded-layout' : ''}`}>
        {/* القسم الترحيبي */}
        <div className="hero-section">
          <div className="logo-area">
            <span className="logo-icon">🔒</span>
            <span className="logo-text">خزنة الصور</span>
          </div>
          <h1>مرحباً بك في <span className="highlight-text">نظام الأمان</span></h1>
          <p>قم بإدارة صورك الخاصة بكل أمان وسهولة بداخل بيئة عمل متطورة</p>
        </div>

        {/* البطاقة الرئيسية (تسجيل الدخول أو لوحة الخزنة) */}
        <div className={`login-card ${isLoggedIn ? 'vault-card-wide' : ''}`}>
          {!isLoggedIn ? (
            /* نموذج تسجيل الدخول (اسم المستخدم وكلمة المرور فقط) */
            <div className="animate-fade">
              <div className="login-header">
                <h2>تسجيل الدخول</h2>
                <p>أدخل بيانات الحساب للوصول إلى الخزنة</p>
              </div>

              <form onSubmit={handleLogin} className="login-form">
                {loginError && <p className="error-text">{loginError}</p>}
                
                <div className="input-group">
                  <label>اسم المستخدم</label>
                  <div className="input-wrapper">
                    <span className="icon">👤</span>
                    <input 
                      type="text" 
                      placeholder="أدخل اسم المستخدم"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>كلمة المرور</label>
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

                <button type="submit" className="login-btn">دخول إلى الخزنة</button>
              </form>
            </div>
          ) : (
            /* لوحة الخزنة وإدارة الصور */
            <div className="vault-container">
              <div className="vault-header">
                <h2>خزنة الصور الخاصة</h2>
                <p className="vault-user-email">المستخدم: {username}</p>
              </div>

              {/* تبويبات التنقل */}
              <div className="vault-nav-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
                  onClick={() => setActiveTab('gallery')}
                >
                  📁 المعرض ({images.length})
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'trash' ? 'active' : ''}`}
                  onClick={() => setActiveTab('trash')}
                >
                  🗑️ المحذوفات ({trash.length})
                </button>
              </div>

              {activeTab === 'gallery' && (
                <>
                  {/* شريط التصنيفات */}
                  <div className="categories-bar">
                    {['الكل', 'طبيعة', 'مناظر'].map(cat => (
                      <button 
                        key={cat}
                        className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* زر رفع صورة */}
                  <div className="upload-section">
                    <label className="upload-btn">
                      ➕ رفع صورة جديدة
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>
                  </div>

                  {/* شبكة عرض الصور */}
                  <div className="gallery-grid-full">
                    {filteredImages.length > 0 ? (
                      filteredImages.map(img => (
                        <div key={img.id} className="image-card-full">
                          <img src={img.url} alt="Vault item" />
                          <span className="img-badge">{img.category}</span>
                          <button 
                            className="delete-icon-btn"
                            onClick={() => handleDeleteImage(img.id)}
                            title="حذف"
                          >
                            ❌
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="no-images-text">لا توجد صور مضافة في هذا القسم حالياً.</p>
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
                          <button className="restore-btn" onClick={() => handleRestoreImage(img.id)}>استعادة</button>
                          <button className="perm-delete-btn" onClick={() => handlePermanentDelete(img.id)}>حذف نهائي</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-images-text">سلة المحذوفات فارغة.</p>
                  )}
                </div>
              )}

              <button className="logout-btn" onClick={() => setIsLoggedIn(false)}>
                🚪 تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className="footer-copyright">
        جميع الحقوق محفوظة © 2026 - نظام خزنة الصور
      </footer>
    </div>
  );
}

App.jsx;
export default App;
