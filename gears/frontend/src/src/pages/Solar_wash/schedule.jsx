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

  const MieleConnect = () => {
    const clientId = "c89f097a-b3cf-40f0-964e-cd85f5a75038";
    const redirectUri = encodeURIComponent("https://localhost:3000/api/miele/callback");
    
    const authUrl = `https://api.mcs3.miele.com/thirdparty/login?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=all`;
    window.location.href = authUrl;
  };
  
  return (
    
    <div style={{ padding: '2rem', textAlign: 'center'}}>
      <h1>Bienvenue sur l'espace Parents</h1>
      <div style={{display:"flex", gap:"1rem", padding: '1rem', justifyContent: 'center', alignItems: 'center'}}>
      <button style={styles.button} onClick={goToDash}>Revenir à l'acceuil</button>
      <button style={styles.button} onClick={goToTable}>Voir les tableaux de donnéese</button>
      <button style={styles.button} onClick={Logout}>Se Déconnecter</button>
      </div>
      <div style={{display: 'flex', maxWidth: '1400px', margin: '0 auto', flexDirection: 'row' }}>
          <MyBarChart
            data={temp} 
            valx="time"    
            valy="sun"
            unit="w/m2"
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
        
      <div style={{ 
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
        maxWidth : "50%"
      }}>
        
        <span style={{ color: '#000000', fontWeight: 'bold', fontSize: '0.9rem' }}>
            Date
          </span>

          {/* Type de programme avec une petite icône ou un badge */}
          <span style={{ fontWeight: 'bold', color: '#000000' }}>
            Type de programme
          </span>

          <span style={{ fontWeight: 'bold', color: '#000000' }}>
            Autheur
          </span>

          {/* Statut avec couleur dynamique */}
          <span style={{ 
            padding: '4px 8px', 
            borderRadius: '12px', 
            fontSize: '0.8rem',
            fontWeight: 'bold',
            color: '#000000'
          }}>
            Terminé?
          </span>
      </div>

      {wash.slice(0, 5).map((program) => (
        <div key={program.id} style={{ 
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
          maxWidth : "50%"
        }}>
          {/* Date et Heure formatée */}
          <span style={{ color: '#888', fontSize: '0.9rem' }}>
            {new Date(program.time).toLocaleString('fr-FR', { 
              day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
            })}
          </span>

          {/* Type de programme avec une petite icône ou un badge */}
          <span style={{ fontWeight: 'bold', color: '#555' }}>
            Type {program.type}
          </span>

          <span style={{ fontWeight: 'bold', color: '#555' }}>
            par: {program.author.username}
          </span>

          {/* Statut avec couleur dynamique */}
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

      <div style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent : 'center',
        maxWidth: '300px', 
        margin: '0 auto' 
        }}>
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
    color: 'white', 
    border: 'none', 
    borderRadius: '5px', 
    cursor: 'pointer',
    height: '50px'
  }
};

export default Schedule
