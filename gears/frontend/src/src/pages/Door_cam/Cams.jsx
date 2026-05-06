import { useState, useEffect } from 'react'

import { AppNavigation } from '../../models/navigation';
import { Fetches } from '../../models/fetchData';

import '../../App.css'


function Cams()
{
    const streamUrl = "/go2rtc/webrtc.html?src=camera_parents";
    const {goToDash, goToTable, Logout} = AppNavigation();

    const OpenDoor = () => {console.log("Porte ouverte")};

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '20px auto', gap:'1rem', display: 'flex', flexDirection : 'column' }}>
        <div>
            <button style={{...styles.button, background: '#007bff'}} onClick={goToDash}>Revenir à l'acceuil</button>
        </div>
        <p style={{ textAlign: 'center', marginTop: '10px', color: '#666' }}>
            🔴 Flux de test en direct (M2 Logic Core)
        </p>
        <div style={{ 
            position: 'relative', 
            paddingBottom: '56.25%', // Ratio 16:9
            height: 0, 
            overflow: 'hidden',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
        }}>
            <iframe
            src={streamUrl}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none'
            }}
            allow="autoplay"
            />
        </div>
        
        <div style = {{
                display: 'flex',
                flexDirection : 'column',
                gap: '3rem',
                alignItems: 'center', 
        }}>
            <div style = {{
                display: 'flex',
                flexDirection : 'row',
                gap: '1rem',
                textAlign: 'center',
                position: 'center'
            }}>
                <button style={{...styles.button, background: '#00ff33'}} onClick={OpenDoor}>Ouvrir la porte</button>
                <button style={{...styles.button, background: '#007bff'}} onClick={goToDash}>Revenir à l'acceuil</button>
            </div>
        </div>
    </div>
  );
}

const styles = {
  button: { 
    padding: '10px',
    maxFontSize: '100%',
    color: 'black', 
    border: 'none', 
    borderRadius: '5px', 
    cursor: 'pointer',
    maxHeight: '100px',
    maxWidth: '300px'
  }
};

export default Cams
