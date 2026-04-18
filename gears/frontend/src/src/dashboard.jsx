import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

import './App.css'

function Dashboard() {
  const navigate = useNavigate();
  
  function goToTable()
  {
    navigate('/table')
  }
  function goToparam()
  {
    navigate('/param')
  }
  function Logout() 
  {
    // 1. On vide le stockage local
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');

    // 2. On redirige vers la page de login
    navigate('/');
  }
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Bienvenue sur l'espace Parents</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px', margin: '0 auto' }}>
        <button style={styles.button} onClick={goToTable}>Voir les tableaux de données</button>
        <button style={styles.button} onClick={goToparam}>Paramètres du compte</button>
        <button style={styles.button} onClick={Logout}>Se Déconnecter</button>
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
