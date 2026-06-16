import { useState, useEffect } from 'react'
import { MyLineChart, MyBarChart } from '../../models/charts'
import { AppNavigation } from '../../models/navigation';
import { Fetches } from '../../models/fetchData';
import { globalDiv, buttonDiv, chartDiv, blueButton, greyButton } from '../../models/styles';

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
    <div style={globalDiv}>
      <h1>Bienvenue sur l'espace Parents</h1>
      <div style={buttonDiv}>
        <button style={blueButton} onClick={goToDash}>Revenir à l'acceuil</button>
        <button style={blueButton} onClick={goToSchedule}>Prevoir une machine</button>
        <button style={greyButton} onClick={Logout}>Se Déconnecter</button>
      </div>
      <div style={chartDiv}>
        <MyBarChart  title="Meteo"                  data={temp} valx="time" valy="temperature" unit='°'    color="#fbbf24" />
        <MyLineChart title="Electricite des panneaux" data={watt} valx="time" valy="watt"       unit="w"    color="#fbbf24" />
      </div>
      <div style={chartDiv}>
        <MyBarChart title="Rayonnement solaire" data={temp} valx="time" valy="sun" unit="w/m2" color="#fbbf24" />
        <MyBarChart title="Rayonnement solaire" data={temp} valx="time" valy="sun" unit="w/m2" color="#fbbf24" />
      </div>
    </div>
  );
}

export default Table
