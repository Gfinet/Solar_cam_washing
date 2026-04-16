import { useState, useEffect } from 'react'

import './App.css'

function Dashboard() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Bienvenue sur l'espace Parents</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px', margin: '0 auto' }}>
        <button style={styles.button} type="submit">Voir les tableaux de données</button>
        <button style={styles.button} type="submit">Paramètres du compte</button>
      </div>
    </div>
  );
}

const styles = {
  button: { 
    padding: '10px', 
    background: '#007bff', 
    color: 'white', 
    border: 'none', 
    borderRadius: '5px', 
    cursor: 'pointer' 
  }
};

export default Dashboard
