import { useState, useEffect } from 'react'
import { MyLineChart, MyBarChart } from '../models/charts'
import { AppNavigation } from '../models/navigation';
import { Fetches } from '../models/fetchTableData';

import '../App.css'

function Table() {
  const {goToDash, goToSchedule, Logout} = AppNavigation();
  const {fetchTemp, fetchWatt} = Fetches()
  
  const [temp, setTemp] = useState([]);
  const [watt, setWatt] = useState([]);
  

  useEffect(() => {
    fetchTemp(setTemp);
    fetchWatt(setWatt);
  }, []);
  return (
    
    <div style={{ padding: '2rem', textAlign: 'center'}}>
      <h1>Bienvenue sur l'espace Parents</h1>
      <div style={{display:"flex", gap:"1rem", padding: '1rem', justifyContent: 'center', alignItems: 'center'}}>
      <button style={styles.button} onClick={goToDash}>Revenir à l'acceuil</button>
      <button style={styles.button} onClick={goToSchedule}>Prevoir une machine</button>
      <button style={styles.button} onClick={Logout}>Se Déconnecter</button>
      </div>
      <div style={{display: 'flex', maxWidth: '1400px', margin: '0 auto', flexDirection: 'row' }}>
          <MyBarChart
            title="Meteo"
            data={temp} 
            valx="time"    
            valy="temperature"
            unit='°'
            color="#fbbf24" 
          />
          <MyLineChart
            title="Electricite des panneaux"
            data={watt} 
            valx="time"    
            valy="watt"
            unit="w"
            color="#fbbf24" 
          />
      </div>
      <div style={{display: 'flex', maxWidth: '1400px', margin: '0 auto', flexDirection: 'row' }}>
          <MyBarChart
            title="Rayonnement solaire"
            data={temp} 
            valx="time"    
            valy="sun"
            unit="w/m2"
            color="#fbbf24" 
          />
          <MyBarChart
            title="Electricite des panneaux"
            data={temp} 
            valx="time"    
            valy="sun"   
            unit="w/m2"
            color="#fbbf24" 
          />
      </div>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        gap: '1rem', 
        maxWidth: '300px', 
        margin: '0 auto' 
        }}>
        
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
    cursor: 'pointer',
    height: '50px'
  }
};

export default Table
