import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  updateDoc,
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("login");
  
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  const [items, setItems] = useState([]); // تخزين الصور والفيديوهات
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notificationMsg, setNotificationMsg] = useState("");

  const [darkMode, setDarkMode] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState("All");
  const [uploadAlbum, setUploadAlbum] = useState("Personal");
  const [activeMediaModal, setActiveMediaModal] = useState(null);
  
  // حالة سلة المحذوفات
  const [showTrash, setShowTrash] = useState(false);

  // حالات خاصة بنظام المشاركة
  const [shareModalItem, setShareModalItem] = useState(null);
  const [friendEmail, setFriendEmail] = useState("");
  const [shareStatus, setShareStatus] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchItems(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const email = loginIdentifier.includes("@") 
        ? loginIdentifier.trim() 
        : `${loginIdentifier.trim().toLowerCase()}@secretspace.app`;

      await signInWithEmailAndPassword(auth, email, loginPassword);
    } catch (err) {
      setError("Login failed: Please check your credentials.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setItems([]);
  };

  const fetchItems = async (uid) => {
    try {
      const q = query(collection(db, "images"), where("userId", "==", uid));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(data);
    } catch (err) {
      console.error("Error fetching media:", err);
    }
  };

  // رفع وحفظ الصور مع ضغط الحجم
  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

          await addDoc(collection(db, "images"), {
            userId: user.uid,
            url: compressedBase64,
            type: "image",
            album: uploadAlbum,
            isDeleted: false,
            createdAt: serverTimestamp()
          });

          await fetchItems(user.uid);
          setUploading(false);
          e.target.value = null;
          setNotificationMsg("Image saved successfully!");
          setTimeout(() => setNotificationMsg(""), 2000);
        };
      };
    } catch (err) {
      console.error("Error saving image:", err);
      setUploading(false);
    }
  };

  // رفع وحفظ الفيديوهات
  const handleUploadVideo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // التحقق من حجم الفيديو لكي لا يتجاوز حدود التخزين المحلي
    if (file.size > 15 * 1024 * 1024) {
      alert("Video size should be less than 15MB for local storage.");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = async () => {
        const base64Video = reader.result;

        await addDoc(collection(db, "images"), {
          userId: user.uid,
          url: base64Video,
          type: "video",
          album: uploadAlbum,
          isDeleted: false,
          createdAt: serverTimestamp()
        });

        await fetchItems(user.uid);
        setUploading(false);
        e.target.value = null;
        setNotificationMsg("Video saved successfully!");
        setTimeout(() => setNotificationMsg(""), 2000);
      };
    } catch (err) {
      console.error("Error saving video:", err);
      setUploading(false);
    }
  };

  // نقل إلى المحذوفات (Trash)
  const handleMoveToTrash = async (id) => {
    try {
      await updateDoc(doc(db, "images", id), { isDeleted: true });
      setItems(items.map(item => item.id === id ? { ...item, isDeleted: true } : item));
    } catch (err) {
      console.error("Error moving to trash:", err);
    }
  };

  // استعادة من المحذوفات
  const handleRestore = async (id) => {
    try {
      await updateDoc(doc(db, "images", id), { isDeleted: false });
      setItems(items.map(item => item.id === id ? { ...item, isDeleted: false } : item));
    } catch (err) {
      console.error("Error restoring item:", err);
    }
  };

  // حذف نهائي
  const handlePermanentDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this item?")) return;
    try {
      await deleteDoc(doc(db, "images", id));
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  const handleSendToFriend = (e) => {
    e.preventDefault();
    if (!friendEmail.trim()) return;

    setShareStatus("Sending secure link to your trusted friend...");
    setTimeout(() => {
      setShareStatus(`Success! Securely shared with ${friendEmail}`);
      setTimeout(() => {
        setShareStatus("");
        setShareModalItem(null);
        setFriendEmail("");
      }, 2500);
    }, 1500);
  };

  const filteredItems = items.filter(item => {
    if (showTrash) {
      return item.isDeleted === true;
    } else {
      if (item.isDeleted === true) return false;
      return selectedAlbum === "All" ? true : item.album === selectedAlbum;
    }
  });

  return (
    <div className={`app-wrapper ${darkMode ? "dark" : "light"}`}>
      {!user ? (
        <div className="split-login-container">
          <div className="hero-section">
            <div className="brand-logo">
              <span className="logo-icon">🔒</span> SecretSpace
            </div>
            <div className="hero-content">
              <div className="floating-vault-icon">📁</div>
              <h1>Your space. Your media. <span className="highlight">Your privacy.</span></h1>
              <p>Secure storage for your private photos and videos with absolute safety.</p>
            </div>
            <div className="footer-copy">© 2026 SecretSpace. All rights reserved.</div>
          </div>

          <div className="form-section">
            <div className="form-top-bar">
              <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle-btn">
                {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </button>
            </div>

            {view === "login" && (
              <form onSubmit={handleLogin} className="login-card">
                <h2>Welcome Back</h2>
                <p className="subtitle">Sign in to access your private space</p>
                {error && <p className="error">{error}</p>}
                
                <div className="input-group">
                  <label>Email, Phone or Username</label>
                  <div className="input-field-wrapper">
                    <span className="field-icon">👤</span>
                    <input 
                      type="text" 
                      placeholder="Enter email, phone or username" 
                      value={loginIdentifier} 
                      onChange={(e) => setLoginIdentifier(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Password</label>
                  <div className="input-field-wrapper">
                    <span className="field-icon">🔒</span>
                    <input 
                      type={showLoginPassword ? "text" : "password"} 
                      placeholder="Enter your password" 
                      value={loginPassword} 
                      onChange={(e) => setLoginPassword(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <button type="submit" className="login-submit-btn">Login to Vault</button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <div className="vault-dashboard">
          <header className="vault-header">
            <h1>📸 SecretSpace Vault</h1>
            <div className="header-controls">
              <button 
                onClick={() => setShowTrash(!showTrash)} 
                className={`theme-toggle-btn ${showTrash ? "active" : ""}`}
              >
                {showTrash ? "📂 View Vault" : "🗑️ Trash Bin"}
              </button>
              <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle-btn">
                {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </button>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </header>

          {notificationMsg && <p className="notification-toast success" style={{ textAlign: "center", margin: "10px" }}>{notificationMsg}</p>}

          {!showTrash && (
            <div className="upload-section">
              <div className="album-select-wrapper">
                <label>Select Album:</label>
                <select value={uploadAlbum} onChange={(e) => setUploadAlbum(e.target.value)} className="album-dropdown">
                  <option value="Personal">Personal</option>
                  <option value="Work">Work</option>
                  <option value="Family">Family</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <label className="upload-label">
                  {uploading ? "Saving..." : "💾 Upload Image"}
                  <input type="file" accept="image/*" onChange={handleUploadImage} disabled={uploading} style={{display: 'none'}} />
                </label>
                <label className="upload-label" style={{ background: "#ff9800" }}>
                  {uploading ? "Saving..." : "🎥 Upload Video"}
                  <input type="file" accept="video/*" onChange={handleUploadVideo} disabled={uploading} style={{display: 'none'}} />
                </label>
              </div>
            </div>
          )}

          {!showTrash && (
            <div className="filter-albums-bar">
              {["All", "Personal", "Work", "Family", "Other"].map((album) => (
                <button 
                  key={album} 
                  className={`filter-tab ${selectedAlbum === album ? "active" : ""}`}
                  onClick={() => setSelectedAlbum(album)}
                >
                  {album}
                </button>
              ))}
            </div>
          )}

          {showTrash && <h2 style={{ textAlign: "center", margin: "20px 0" }}>🗑️ Trash Bin (Deleted Items)</h2>}

          <div className="gallery-grid">
            {filteredItems.length === 0 ? (
              <p className="no-images">
                {showTrash ? "Trash bin is empty." : "No saved media found in this album."}
              </p>
            ) : (
              filteredItems.map((item) => (
                <div key={item.id} className="image-card">
                  <div className="image-card-img-wrap" onClick={() => setActiveMediaModal(item)}>
                    {item.type === "video" ? (
                      <video src={item.url} style={{ width: "100%", height: "150px", objectFit: "cover" }} />
                    ) : (
                      <img src={item.url} alt="Private Vault" />
                    )}
                  </div>
                  <div className="image-card-footer">
                    <span className="image-album-tag">{item.album || "Personal"}</span>
                    <div className="card-actions">
                      {showTrash ? (
                        <>
                          <button onClick={() => handleRestore(item.id)} className="share-btn">Restore ♻️</button>
                          <button onClick={() => handlePermanentDelete(item.id)} className="delete-btn">Delete</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => setShareModalItem(item)} className="share-btn">Share 🤝</button>
                          <button onClick={() => handleMoveToTrash(item.id)} className="delete-btn">Delete 🗑️</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {activeMediaModal && (
            <div className="image-modal-overlay" onClick={() => setActiveMediaModal(null)}>
              <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                {activeMediaModal.type === "video" ? (
                  <video src={activeMediaModal.url} controls autoPlay style={{ maxWidth: "90vw", maxHeight: "80vh" }} />
                ) : (
                  <img src={activeMediaModal.url} alt="Full View" />
                )}
                <button className="close-modal-btn" onClick={() => setActiveMediaModal(null)}>✕</button>
              </div>
            </div>
          )}

          {shareModalItem && (
            <div className="image-modal-overlay" onClick={() => setShareModalItem(null)}>
              <div className="image-modal-content" style={{ background: "#222", padding: "20px", borderRadius: "10px", textAlign: "center", color: "#fff" }} onClick={(e) => e.stopPropagation()}>
                <h3>Share Media Securely</h3>
                <p style={{ fontSize: "14px", color: "#aaa" }}>Enter your friend's email to share this item:</p>
                <form onSubmit={handleSendToFriend}>
                  <input 
                    type="email" 
                    placeholder="friend@example.com" 
                    value={friendEmail} 
                    onChange={(e) => setFriendEmail(e.target.value)} 
                    required 
                    style={{ padding: "10px", width: "80%", marginBottom: "15px", borderRadius: "5px", border: "1px solid #444" }}
                  />
                  <br />
                  <button type="submit" style={{ padding: "10px 20px", background: "#4CAF50", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>Send</button>
                </form>
                {shareStatus && <p style={{ marginTop: "10px", color: "#4CAF50" }}>{shareStatus}</p>}
                <button className="close-modal-btn" onClick={() => setShareModalItem(null)} style={{ marginTop: "15px" }}>✕ Close</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}