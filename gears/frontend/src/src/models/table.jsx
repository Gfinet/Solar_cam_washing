import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { MyLineChart, MyBarChart } from './charts'

import '../App.css'

function Table() {
  const navigate = useNavigate();
  
  function goToDash()
  {
    navigate('/dashboard')
  }
  function goToparam()
  {
    navigate('/param')
  }
  function Logout() 
  {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    navigate('/');
  }
  const [temp, setTemp] = useState([]);
  const [watt, setWatt] = useState([]);

  useEffect(() => {
    fetch('/api/temptoday',{
      method: 'GET',
      headers: {
      'Content-Type': 'application/json',
    }})
    .then(res => res.json())
    .then(data => {
      // console.log(data)
      const val = Array(data.message.length)
      for (let i=0; i<data.message.length; i++)
      {
        const time = new Date(data.message[i].time)
        val[i] = {
          time : time.getUTCHours() + "h",
          temperature : data.message[i].temp,
          sun  : data.message[i].SolarRay
        }
      }
      setTemp(val);
    })
    fetch('/api/mbtoday',{
      method: 'GET',
      headers: {
      'Content-Type': 'application/json',
    }})
    .then(res => res.json())
    .then(data => {
      const val = Array(data.message.length)
      for (let i=0; i<data.message.length; i++)
      {
        const time = new Date(data.message[i].time)
        let hour = data.message[i].time + 2
        if (hour >= 24)
          hour = hour -24
        const timestr = hour + "h";
        val[i] = {
          time : timestr,
          temperature : data.message[i].watts
        }
      }
      setWatt(val);
    })
  }, []);
  return (
    
    <div style={{ padding: '2rem', textAlign: 'center'}}>
      <h1>Bienvenue sur l'espace Parents</h1>
      <div style={{display:"flex", gap:"1rem", padding: '1rem', justifyContent: 'center', alignItems: 'center'}}>
      <button style={styles.button} onClick={goToDash}>Revenir à l'acceuil</button>
      <button style={styles.button} onClick={goToparam}>Paramètres du compte</button>
      <button style={styles.button} onClick={Logout}>Se Déconnecter</button>
      </div>
      <div style={{display: 'flex', maxWidth: '1400px', margin: '0 auto', flexDirection: 'row' }}>
          <MyBarChart
            data={temp} 
            valx="time"    
            valy="temperature"
            unit='°'
            color="#fbbf24" 
          />
          <MyLineChart
            data={watt} 
            valx="time"    
            valy="temperature"
            unit="w"
            color="#fbbf24" 
          />
      </div>
      <div style={{display: 'flex', maxWidth: '1400px', margin: '0 auto', flexDirection: 'row' }}>
          <MyBarChart
            data={temp} 
            valx="time"    
            valy="sun"
            unit="w/m2"
            color="#fbbf24" 
          />
          <MyBarChart
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
