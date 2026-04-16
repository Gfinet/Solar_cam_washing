// src/Layout.jsx
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <h1>Solar'Cams</h1>
      </header>
      
      <main style={styles.content}>
        {/* C'est ici que Login ou Dashboard s'afficheront */}
        <Outlet />
      </main>
    </div>
  );
};

const styles = {
  wrapper: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  header: { 
    background: '#1a1a1a', 
    color: '#007bff', 
    textAlign: 'center',
    borderBottom: '1px solid #333'
  },
  content: { flex: 1, padding: '20px' }
};

export default Layout;