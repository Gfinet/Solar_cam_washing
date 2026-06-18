import { useState, useEffect } from 'react'
import { MyLineChart, MyBarChart, TimeSlider } from '../../models/charts'
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

  const WINDOW = 4; // ±6 points de chaque côté
  const [tempCenter, setTempCenter] = useState(WINDOW);
  const [wattCenter, setWattCenter] = useState(WINDOW);

  useEffect(() => {
    fetchTemp(data => {
      setTemp(data);
      const idx14 = data.findIndex(d => d.time.startsWith('14'));
        setTempCenter(idx14 !== -1 ? idx14 : Math.floor(data.length / 2));
    });
    fetchWatt(data => {
      setWatt(data);
      const idx14 = data.findIndex(d => d.time.startsWith('14'));
      setWattCenter(idx14 !== -1 ? idx14 : Math.floor(data.length / 2));
    });
    fetchWashingProg(setWash);
  }, []);

  const tempSlice = temp.slice(
    Math.max(0, tempCenter - WINDOW),
    Math.min(temp.length, tempCenter + WINDOW + 1)
  );
  const wattSlice = watt.slice(
    Math.max(0, wattCenter - WINDOW),
    Math.min(watt.length, wattCenter + WINDOW + 1)
  );
  

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

  const chartData = {
        //title       data     valx      valy              unit
    w : {t : "Meteo", d: tempSlice, x:"time", y: "temperature", u:'°'},
    e : {t : "Electricite des panneaux", d: wattSlice, x:"time", y: "watt", u:'w'},
    r : {t : "Rayonnement solaire", d: tempSlice, x:"time", y: "sun", u:'w/m2'}
  }
  const c = "#fbbf24"
  
  return (
    <div style={globalDiv}>
      <h1>Bienvenue sur l'espace Parents</h1>
      <div style={buttonDiv}>
        <button style={blueButton} onClick={goToDash}>Revenir à l'acceuil</button>
        <button style={blueButton} onClick={goToTable}>Tableaux de données</button>
        <button style={greyButton} onClick={Logout}>Se Déconnecter</button>
      </div>

      <TimeSlider
        data={temp} center={tempCenter}
        onCenterChange={setTempCenter} windowSize={WINDOW}
        label="Météo & Rayonnement"
      />
      <div style={chartDiv}>
        <MyBarChart  title={chartData.w.t} data={chartData.w.d} valx={chartData.w.x} valy={chartData.w.y} unit={chartData.w.u} color={c} />
        <MyLineChart title={chartData.e.t} data={chartData.e.d} valx={chartData.e.x} valy={chartData.e.y} unit={chartData.e.u} color={c} />
      </div>
        
      <div style={washHeaderDiv}>
        <span style={{...washHeaderCell, width:'20%'}}>Date</span>
        <span style={{...washHeaderCell, width:'30%'}}>Programme</span>
        <span style={{...washHeaderCell, width:'30%'}}>Autheur</span>
        <span style={{...washHeaderCell, width:'20%', justifyContent:'flex-end'}}>Terminé?</span>
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
            {program.author.username}
          </span>
          <span style={{ 
            padding: '4px 8px', 
            borderRadius: '12px', 
            fontSize: '0.8rem',
            backgroundColor: program.finished ? '#d4edda' : '#fff3cd',
            color: program.finished ? '#155724' : '#856404'
          }}>
            {program.finished ? 'Terminé' : 'En cours'}
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
  width: '90%',
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
