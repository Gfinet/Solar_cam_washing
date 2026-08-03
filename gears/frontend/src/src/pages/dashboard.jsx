import { useState, useEffect } from 'react'
import { MyBarChart } from '../class/charts'
import { ClimPannel } from '../class/climPannel';
import { AppNavigation } from '../models/navigation';
import { Fetches } from '../models/fetchData';
import { blueButton, greyButton, rowDiv, globalDiv } from '../models/styles';

import '../App.css'

function Dashboard() {
  const {goToTable, goToSchedule, goToCams, goToFast, Logout} = AppNavigation();
  const {fetchTemp, fetchClim} = Fetches();

  const [temp, setTemp] = useState([]);
  const [clim, setClim] = useState({});

  useEffect(() => {
    fetchTemp(setTemp);
    fetchClim(setClim);
  }, []);

  return (
    <div style={globalDiv}>
      <h1>Bienvenue sur l'espace Parents</h1>
      <MyBarChart data={temp} valx="time" valy="temperature" color="#fbbf24" unit='°' sep={true}/>
      <ClimPannel data={clim} setClim={setClim} clim={clim}/>
      <div style={tableDiv}>
        <div style={rowDiv}>
          <button style={blueButton} onClick={goToTable}>📊 Voir les tableaux de données</button>
          <button style={blueButton} onClick={goToSchedule}>🧺 Prevoir une machine</button>
        </div>
        <div style={rowDiv}>
          <button style={blueButton} onClick={goToCams}>📷 Voir la camera</button>
          <button style={blueButton} onClick={goToFast}>⚡ Machine rapide</button>
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
