import { useState, useEffect } from 'react'
import { MyLineChart, MyBarChart } from '../../models/charts'
import { AppNavigation } from '../../models/navigation';
import { Fetches } from '../../models/fetchData';
import { globalDiv, buttonDiv, chartDiv, blueButton, greyButton } from '../../models/styles';

import '../../App.css'

function Schedule() {
  
  const {goToDash, goToTable, Logout} = AppNavigation();
  const {fetchTemp, fetchWatt, fetchWashingProg} = Fetches()

  const [temp, setTemp] = useState([]);
  const [watt, setWatt] = useState([]);
  const [wash, setWash] = useState([])
  
  useEffect(() => {
    fetchTemp(setTemp);
    fetchWatt(setWatt);
    fetchWashingProg(setWash);
  }, []);

  const MieleConnect = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/miele/connect', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
    }})
    const data = await response.json();
    window.location.href = data.url;
  };
  
  return (
    <div style={globalDiv}>
      <h1>Bienvenue sur l'espace Parents</h1>
      <div style={buttonDiv}>
        <button style={blueButton} onClick={goToDash}>Revenir à l'acceuil</button>
        <button style={blueButton} onClick={goToTable}>Voir les tableaux de donnéese</button>
        <button style={greyButton} onClick={Logout}>Se Déconnecter</button>
      </div>
      <div style={chartDiv}>
        <MyBarChart  data={temp} valx="time" valy="sun"         unit="w/m2" color="#fbbf24" />
        <MyLineChart data={watt} valx="time" valy="temperature" unit="w"    color="#fbbf24" />
      </div>
        
      <div style={washHeaderDiv}>
        <span style={washHeaderCell}>Date</span>
        <span style={washHeaderCell}>Type de programme</span>
        <span style={washHeaderCell}>Autheur</span>
        <span style={washHeaderCell}>Terminé?</span>
      </div>

      {wash.slice(0, 5).map((program) => (
        <div key={program.id} style={washRowDiv}>
          <span style={{ color: '#888', fontSize: '0.9rem' }}>
            {new Date(program.time).toLocaleString('fr-FR', { 
              day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
            })}
          </span>
          <span style={{ fontWeight: 'bold', color: '#555' }}>
            Type {program.type}
          </span>
          <span style={{ fontWeight: 'bold', color: '#555' }}>
            par: {program.author.username}
          </span>
          <span style={{ 
            padding: '4px 8px', 
            borderRadius: '12px', 
            fontSize: '0.8rem',
            backgroundColor: program.finished ? '#d4edda' : '#fff3cd',
            color: program.finished ? '#155724' : '#856404'
          }}>
            {wash[0].finished ? 'Terminé' : 'En cours'}
          </span>
        </div>
      ))}

      <div style={{...buttonDiv, marginTop: '1rem'}}>
        <button style={blueButton} onClick={MieleConnect}>Conexion a Miele</button>
        <button style={blueButton}>Programmer une machine</button>
      </div>
    </div>
  );
}

// Spécifiques à schedule
const washRowDiv = {
  display: 'flex', 
  justifyContent: 'space-between',
  textAlign: 'center',
  alignItems: 'center', 
  padding: '10px 15px', 
  borderBottom: '1px solid #eee',
  backgroundColor: '#fff',
  borderRadius: '8px',
  marginBottom: '8px',
  margin: '0 auto',
  width: '50%',
};

const washHeaderDiv = {
  ...washRowDiv,
  marginBottom: '4px',
};

const washHeaderCell = {
  fontWeight: 'bold',
  color: '#000000',
  fontSize: '0.9rem',
};

export default Schedule
