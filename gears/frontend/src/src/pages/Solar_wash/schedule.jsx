import { useState, useEffect } from 'react'
import { MyLineChart, MyBarChart, TimeSlider } from '../../models/charts'
import { AppNavigation } from '../../models/navigation';
import { Fetches } from '../../models/fetchData';
import { WashTable } from '../../models/washTable';
import { globalDiv, buttonDiv, chartDiv, blueButton, greyButton } from '../../models/styles';

import '../../App.css'

function Schedule() {
  
  const {goToDash, goToTable, Logout} = AppNavigation();
  const {fetchTemp, fetchWatt, fetchDbWashingProg, fetchWashDevices, fetchDevInfo} = Fetches()


  const [temp, setTemp] = useState([]);
  const [watt, setWatt] = useState([]);
  const [wash, setWash] = useState([]);
  const [devices, setDevices] = useState([]);
  const [devInfo, setDevInfo] = useState(null);
  const [mieleConnected, setMieleConnected] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState('/');

  // let mieleConnected;

  //  ±4 points de chaque côté
  const WIN = 4;
  const [tempCenter, setTempCenter] = useState(WIN);
  const [wattCenter, setWattCenter] = useState(WIN);

  const changeDevice = (e) => {
    setSelectedDevice(e.target.value);
    if (e.target.value !== "/") fetchDevInfo(setDevInfo, e.target.value);
    else                        setDevInfo(null)
    console.log("devInfo",devInfo)
  };

  const Now = new Date().toLocaleString('fr-BE', { hour: '2-digit', timeZone: 'Europe/Brussels' });

  useEffect(() => {
    fetchTemp(data => {
      setTemp(data);
      const idxNow = data.findIndex(d => d.time.startsWith(Now.slice(0, 2)));
      setTempCenter(idxNow !== -1 ? idxNow : Math.floor(data.length / 2));
    });
    fetchWatt(data => {
      setWatt(data);
      const idxNow = data.findIndex(d => d.time.startsWith(Now.slice(0, 2)));
      setWattCenter(idxNow !== -1 ? idxNow : Math.floor(data.length / 2));
    });
    console.log("getting db Progrm")
    fetchDbWashingProg(setWash);

  
  // const idxNow = data.findIndex(d => d.time.startsWith(Now.slice(0, 2)));
  // setCenter(idxNow !== -1 ? idxNow : Math.floor(data.length / 2));
  // console.log("N", Now)
    
    const checkConnect = async () =>{
      const connected = await isMieleConnected();
      if (connected === true) 
      {
        console.log("getting devices")
        setMieleConnected(1);
        fetchWashDevices(setDevices);
      }
    }
    checkConnect()
    
  }, []);

  const tempSlice = temp.slice(
    Math.max(0, tempCenter - WIN),
    Math.min(temp.length, tempCenter + WIN + 1)
  );
  const wattSlice = watt.slice(
    Math.max(0, wattCenter - WIN),
    Math.min(watt.length, wattCenter + WIN + 1)
  );

  const chartData = {
        //title       data          valx      valy              unit               total
    w : {t : "Meteo", d: tempSlice, x:"time", y: "temperature", u:'°'},
    e : {t : "Electricite des panneaux", d: wattSlice, x:"time", y: "watt", u:'w', tt: watt.total},
    r : {t : "Rayonnement solaire", d: tempSlice, x:"time", y: "sun", u:'w'}
  }
  const c = "#fbbf24"
  
  const isMieleConnected = async () =>{
    const token = localStorage.getItem('token');
    const response = await fetch('/api/miele/token', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
    }})
    const data = await response.json();
    // console.log("data",data)
    return data.success
  }

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

  const refreshDevInfo = () => {
    if (selectedDevice !== '/')
      fetchDevInfo(setDevInfo, selectedDevice);
  };

  const scheduleProgram = () =>{

    console.log("check Connect to Miele")
    console.log("check connect to machine")
    console.log("selecting programs")
    console.log("adding program to db")
    console.log("confirmation")
    console.log("program added")
  }

  
  return (
    <div style={globalDiv}>
      <h1>Bienvenue sur l'espace Machine</h1>
        
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
        <button style={{...blueButton, width : "100%"}} onClick={MieleConnect}>Conexion a Miele</button>
      </div>

      <TimeSlider
        data={temp} center={tempCenter}
        onCenterChange={setTempCenter} windowSize={WIN}
        label="Météo & Rayonnement"
      />
      <div style={chartDiv}>
        <MyBarChart 
          title={chartData.r.t} 
          data={chartData.r.d} 
          valx={chartData.r.x} 
          valy={chartData.r.y} 
          unit={chartData.r.u} 
          color={c} />
        <MyLineChart 
          title={chartData.e.t} 
          data={chartData.e.d} 
          valx={chartData.e.x} 
          valy={chartData.e.y} 
          unit={chartData.e.u} 
          color={c} 
          total={chartData.e.tt}/>
      </div>

      {(mieleConnected === null) ? (
        <>
        <h2>Veuillez vous connecter à Miele pour lancer une machine</h2>
        </>
      ): 
      (
        <div style={formDiv}>
          <h2 style={{textAlign:'flex-start'}}> Sélectionner la machine à lancer</h2>
          <select id="device-select" value={selectedDevice} onChange={changeDevice} style={selectStyle}>
            
            <option value="/">Num de serie - Nom - Type</option>
            {devices.map((device) => (
              <option key={device.fabNumber} value={device.fabNumber}> 
                {device.fabNumber} - "{device.name}" - ({device.type})
              </option>
            ))}
          </select>
          {(selectedDevice !== "/" && devInfo !== null) ? (
            <div style={Table}>
              <div style={Row}>
                <h2 style={txt}>Infos:</h2></div>
              <div style={Row}>
                <h2 style={txt}>Status:</h2>
                {(devInfo.state.status) ? 
                ( <h2 style={txt}>{devInfo.state.status.value_localized}</h2> ) :
                ( <h2 style={txt}>ERROR</h2> )
                }
              </div> 
              <WashTable devInfo={devInfo} onAction={refreshDevInfo} />

            </div>
          ) : (
            <>
              <div style={{...Row, alignSelf:'center'}}>
                <h2 style={{color: 'white'}}>No machine picked</h2>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
//${devInfo.state.ProgramID.value_localized}
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

const formDiv = {
  display : 'flex',
  width : '100%',
  flexDirection: 'column',
  justifyContent: 'center',
  textAlign : 'left'
}

const selectStyle = { 
  padding: '8px',
  width: '100%',
}

const Table = {
  width: '100%',
  backgroundColor:'grey',
  justifyContent: 'space-between',
  borderRadius: '5px',
}

const Row ={
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  width : 'auto',
  height : 'auto'

}

const txt = {
  color:'black',
  fontSize: '15px'
}

export default Schedule


