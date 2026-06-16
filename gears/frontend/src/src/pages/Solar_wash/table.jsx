import { useState, useEffect } from 'react'
import { MyLineChart, MyBarChart } from '../../models/charts'
import { AppNavigation } from '../../models/navigation';
import { Fetches } from '../../models/fetchData';

import '../../App.css'

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
    
    <div style={styles.globalDiv}>
      <h1>Bienvenue sur l'espace Parents</h1>
      <div style={styles.buttonDiv}>
        <button style={styles.button} onClick={goToDash}>Revenir à l'acceuil</button>
        <button style={styles.button} onClick={goToSchedule}>Prevoir une machine</button>
        <button style={styles.button} onClick={Logout}>Se Déconnecter</button>
      </div>
      <div style={styles.chartDiv}>
          <MyBarChart title="Meteo" data={temp} valx="time" valy="temperature" unit='°' color="#fbbf24" />
          <MyLineChart title="Electricite des panneaux" data={watt}  valx="time" valy="watt" unit="w" color="#fbbf24" />
      </div>
      <div style={styles.chartDiv}>
          <MyBarChart title="Rayonnement solaire" data={temp}  valx="time" valy="sun" unit="w/m2" color="#fbbf24" />
          <MyBarChart title="Rayonnement solaire" data={temp}  valx="time" valy="sun" unit="w/m2" color="#fbbf24" />
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
  },
  globalDiv: { 
    display: 'flex' , 
    flexDirection:'column', 
    padding: '2rem', 
    alignItems: 'center'
  },
  buttonDiv: {
    display:"flex", 
    gap:"1rem", 
    padding: '1rem', 
    flexDirection: 'row'
  },
  chartDiv: {
    display: 'flex', 
    margin: '0 auto', 
    flexDirection: 'row', 
    width:"100%"
  },

};

export default Table
