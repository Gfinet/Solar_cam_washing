import { useState, useEffect } from 'react'
import { MyBarChart } from '../models/charts'
import { AppNavigation } from '../models/navigation';
import { Fetches } from '../models/fetchTableData';

import '../App.css'

function Dashboard() {
  const {goToTable, goToSchedule, Logout} = AppNavigation();
  const {fetchTemp, fetchWatt} = Fetches();

  const [temp, setTemp] = useState([]);

  useEffect(() => {
    fetchTemp(setTemp);
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Bienvenue sur l'espace Parents</h1>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
    
        {/* 1. Le Graphique prend toute la largeur du conteneur */}
        <div>
          <MyBarChart
            data={temp} 
            valx="time"    
            valy="temperature"   
            color="#fbbf24"
            unit='°'
          />
        </div>

        {/* 2. Les Boutons rangés en colonne (ou en ligne) */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem', 
          maxWidth: '300px', 
          margin: '0 auto' 
          }}>
          <button style={styles.button} onClick={goToTable}>Voir les tableaux de données</button>
          <button style={styles.button} onClick={goToSchedule}>Prevoir une machine</button>
          <button style={styles.button} onClick={Logout}>Se Déconnecter</button>
        </div>

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
