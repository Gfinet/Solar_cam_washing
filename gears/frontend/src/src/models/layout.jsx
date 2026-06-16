// src/Layout.jsx
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <h1 style={{color:"white"}}>Solar'Cams</h1>
        <script src="https://open.ezvizlife.com/sdk/js/4.3/ezuikit.js"></script>
      </header>
      
      <main style={styles.content}>
        {/* C'est ici que Login ou Dashboard s'afficheront */}
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
  content: { flex: 1, padding: '20px' }
};

export default Layout;