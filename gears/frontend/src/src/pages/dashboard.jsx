import { useState, useEffect } from 'react'
import { MyBarChart } from '../models/charts'
import { AppNavigation } from '../models/navigation';
import { Fetches } from '../models/fetchData';
import { blueButton, greyButton, rowDiv } from '../models/styles';

import '../App.css'

function Dashboard() {
  const {goToTable, goToSchedule, goToCams, Logout} = AppNavigation();
  const {fetchTemp} = Fetches();

  const [temp, setTemp] = useState([]);

  useEffect(() => {
    fetchTemp(setTemp);
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Bienvenue sur l'espace Parents</h1>
      <MyBarChart data={temp} valx="time" valy="temperature" color="#fbbf24" unit='°'/>
      <div style={tableDiv}>
        <div style={rowDiv}>
          <button style={blueButton} onClick={goToTable}>Voir les tableaux de données</button>
          <button style={blueButton} onClick={goToSchedule}>Prevoir une machine</button>
        </div>
        <div style={rowDiv}>
          <button style={blueButton} onClick={goToCams}>Voir la camera</button>
          {/* <button style={blueButton} onClick={goToSchedule}>Prevoir une machine</button> */}
        </div>
        <button style={{...greyButton, alignSelf: 'center'}} onClick={Logout}>Se Déconnecter</button>
      </div>
    </div>
  );
}

// Spécifique au dashboard
const tableDiv = {
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'center',
  gap: '1rem',
};

export default Dashboard
