import { useState, useEffect } from 'react'
import { MyLineChart, MyBarChart } from '../../models/charts'
import { AppNavigation } from '../../models/navigation';
import { Fetches } from '../../models/fetchData';

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
    
    <div style={styles.globalDiv}>
      <h1>Bienvenue sur l'espace Parents</h1>
      <div style={styles.buttonDiv}>
        <button style={styles.button} onClick={goToDash}>Revenir à l'acceuil</button>
        <button style={styles.button} onClick={goToTable}>Voir les tableaux de donnéese</button>
        <button style={styles.button} onClick={Logout}>Se Déconnecter</button>
      </div>
      <div style={styles.chartDiv}>
          <MyBarChart  data={temp} valx="time" valy="sun"         unit="w/m2" color="#fbbf24" />
          <MyLineChart data={watt} valx="time" valy="temperature" unit="w"    color="#fbbf24" />
      </div>
        
      <div style={styles.programTable}>
        <span style={styles.titleTable}>Date</span>
        <span style={styles.titleTable}>Type de programme</span>
        <span style={styles.titleTable}>Auteur</span>
        <span style={styles.titleTable}>Terminé?</span>
      </div>

      {wash.slice(0, 5).map((program) => (
        <div key={program.id} style={styles.programTable}>
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

          <span style={{...styles.finishedIndicator, 
            backgroundColor: program.finished ? '#d4edda' : '#fff3cd',
            color: program.finished ? '#155724' : '#856404'}}>
            {program.finished ? 'Terminé' : 'En cours'}
          </span>
        </div>
      ))}

      <div style={styles.buttonDiv}>
      <button style={styles.button} onClick={MieleConnect}>Conexion a Miele</button>
      <button style={styles.button} >Programmer une machine</button>
      </div>
    </div>
  );
}

const styles = {
  button: { 
    padding: '10px', 
    background: '#007bff', 
    width: '300px', 
    color: 'black', 
    border: 'none', 
    borderRadius: '5px', 
    cursor: 'pointer',
    height: '50px',
    fontSize: '100%'
  },
  globalDiv: { 
    display: 'flex' , 
    flexDirection:'column', 
    padding: '2rem', 
    justifyContent: 'center', 
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
  programTable: { 
    display: 'flex', 
    justifyContent: 'space-between',
    alignItems: 'center', 
    padding: '10px 15px', 
    borderBottom: '1px solid #eee',
    backgroundColor: '#fff',
    borderRadius: '8px',
    width : "50%"
  },
  titleTable: {
    fontWeight: 'bold', 
    color: '#000000'
  },
  finishedIndicator: { 
    padding: '4px 8px', 
    borderRadius: '12px', 
    fontSize: '0.8rem',
  },
};

export default Schedule
