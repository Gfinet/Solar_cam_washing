// src/Layout.jsx
import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';


const Layout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const goTo = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/');
    setMenuOpen(false);
  };

  const goToDash = () => {
    navigate('/dashboard');
  }

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <h1 style={{color:"white"}} onClick={goToDash}>Solar'Cams</h1>
        <script src="https://open.ezvizlife.com/sdk/js/4.3/ezuikit.js"></script>
      </header>
      
      <button style={styles.hamburger} onClick={() => setMenuOpen(o => !o)}>
        {menuOpen ? '✕' : '☰'}
      </button>

      {menuOpen && (
        <>
          {/* Overlay pour fermer en cliquant ailleurs */}
          <div style={styles.overlay} onClick={() => setMenuOpen(false)} />
          <nav style={styles.menu}>
            <button style={styles.menuItem} onClick={() => goTo('/dashboard')}>🏠 Accueil</button>
            <button style={styles.menuItem} onClick={() => goTo('/schedule')}>🧺 Machine</button>
            <button style={styles.menuItem} onClick={() => goTo('/table')}>📊 Tableaux</button>
            <button style={styles.menuItem} onClick={() => goTo('/cams')}>📷 Caméras</button>
            <hr style={{ border: '1px solid #444', margin: '8px 0' }} />
            <button style={{ ...styles.menuItem, color: '#ff6b6b' }} onClick={logout}>🚪 Déconnexion</button>
          </nav>
        </>
      )}

      <main style={styles.content}>
        <Outlet />
      </main>
    </div>
  );
};

const styles = {
  wrapper: { 
    minHeight: '100vh', 
    display: 'flex', 
    flexDirection: 'column' 
  },
  header: { 
    background: '#1a1a1a', 
    color: '#ffffff', 
    textAlign: 'center',
    borderBottom: '1px solid #333'
  },
  content: { flex: 1 },

  hamburger: {
    position: 'fixed',
    top: '12px',
    right: '16px',
    zIndex: 1000,
    background: '#1a1a1a',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1.4rem',
    width: '42px',
    height: '42px',
    cursor: 'pointer',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 998,
  },
  menu: {
    position: 'fixed',
    top: '60px',
    right: '16px',
    zIndex: 999,
    background: '#1a1a1a',
    borderRadius: '8px',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    minWidth: '180px',
  },
  menuItem: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    padding: '10px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '1rem',
  },
};

export default Layout;