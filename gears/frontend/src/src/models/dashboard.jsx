import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { MyLineChart, MyBarChart } from './charts'

import '../App.css'

function Dashboard() {
  const navigate = useNavigate();
  
  function goToTable()
  {
    navigate('/table')
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

  useEffect(() => {
    fetch('/api/temptoday',{
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
        let hour = time.getHours() - 2
        if (hour < 0)
          hour = 24 + hour
        const timestr = hour.toString() + "h";
        val[i] = {
          time : timestr,
          temp : data.message[i].temp
        }
      }
      setTemp(val);
    })
  }, []);
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Bienvenue sur l'espace Parents</h1>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
    
        {/* 1. Le Graphique prend toute la largeur du conteneur */}
        <div style={{ marginBottom: '2rem' }}>
          <MyBarChart
            data={temp} 
            valx="time"    
            valy="temp"   
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
          <button style={styles.button} onClick={goToparam}>Paramètres du compte</button>
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
