import { useState, useEffect } from 'react'
import { MyLineChart, MyBarChart, TimeSlider } from '../../models/charts'
import { AppNavigation } from '../../models/navigation';
import { Fetches } from '../../models/fetchData';
import { globalDiv, buttonDiv, chartDiv, blueButton, greyButton, greenButton } from '../../models/styles';

import '../../App.css'

function Schedule() {
  
  const {goToDash, goToTable, Logout} = AppNavigation();
  const {fetchTemp, fetchWatt, fetchWashingProg, fetchWashDevices, fetchDevInfo} = Fetches()

  const [temp, setTemp] = useState([]);
  const [watt, setWatt] = useState([]);
  const [wash, setWash] = useState([]);
  const [devices, setDevices] = useState([]);
  const [devInfo, setDevInfo] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState('/');
  const [selectedProgram, setSelectedProgram] = useState('/');
  const [heureCible, setHeureCible] = useState('00:00')

  const WIN = 4; // ±6 points de chaque côté
  const [tempCenter, setTempCenter] = useState(WIN);
  const [wattCenter, setWattCenter] = useState(WIN);


  const changeDevice = (e) =>{
    // console.log("E", e.target.value)
    setSelectedDevice(e.target.value);
    // console.log("target",selectedDevice)
    if (e.target.value !== "/")
      fetchDevInfo(setDevInfo, e.target.value);
    else
      setDevInfo(null)
    console.log("devInfo",devInfo)
  };

  const changeProgram = (e) => {
    // console.log("prgm", e.target.value)
    setSelectedProgram(e.target.value)
  }

  const handleTimeChange = (e) => {
    console.log("time", e.target.value)
    setHeureCible(e.target.value)
  }

  const savePrgm = () => {
    if (selectedProgram !== "/")
      console.log("program", selectedProgram ,"added", heureCible)
  }

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
    fetchWashDevices(setDevices);
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
        //title       data     valx      valy              unit
    w : {t : "Meteo", d: tempSlice, x:"time", y: "temperature", u:'°'},
    e : {t : "Electricite des panneaux", d: wattSlice, x:"time", y: "watt", u:'w'},
    r : {t : "Rayonnement solaire", d: tempSlice, x:"time", y: "sun", u:'w/m2'}
  }
  const c = "#fbbf24"
  

  const MieleConnect = async () => {
    const token = localStorage.getItem('token');
    console.log("tok", token)
    const response = await fetch('/api/miele/connect', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
    }})
    const data = await response.json();
    window.location.href = data.url;
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
      <h1>Bienvenue sur l'espace Parents</h1>
      <div style={buttonDiv}>
        <button style={blueButton} onClick={goToDash}>Revenir à l'acceuil</button>
        <button style={blueButton} onClick={goToTable}>Tableaux de données</button>
        <button style={greyButton} onClick={Logout}>Se Déconnecter</button>
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
        <button style={blueButton} onClick={scheduleProgram}>Programmer une machine</button>
      </div>

      <TimeSlider
        data={temp} center={tempCenter}
        onCenterChange={setTempCenter} windowSize={WIN}
        label="Météo & Rayonnement"
      />
      <div style={chartDiv}>
        <MyBarChart  title={chartData.w.t} data={chartData.w.d} valx={chartData.w.x} valy={chartData.w.y} unit={chartData.w.u} color={c} />
        <MyLineChart title={chartData.e.t} data={chartData.e.d} valx={chartData.e.x} valy={chartData.e.y} unit={chartData.e.u} color={c} />
      </div>

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
        {(selectedDevice !== "/" && devInfo !== null) && (
          <div style={Table}>
            <div style={Row}>
              <h2 style={txt}>Infos:</h2></div>
            <div style={Row}>
              <h2 style={txt}>Status:</h2>
              <h2 style={txt}>{devInfo.state.status.value_localized}</h2>
            </div>
            
            {(devInfo.state.status.value_raw > 1 &&  devInfo.state.status.value_raw < 8 )&&(
            <>
              <div style={Row}>
                <h2 style={txt}>Programme :</h2>
                <h2 style={txt}>{devInfo.state.ProgramID.value_localized}</h2>
              </div>
              {(devInfo.state.status.value_raw === 4 && devInfo.state.startTime[0] > 0) && (
              //Waiting to start
                <div style={Row}>
                  <h2 style={txt}>Temps avant lancement:</h2>
                  <h2 style={txt}>{devInfo.state.startTime[0]}h{devInfo.state.startTime[1]}</h2>
                </div>
              )}
              {(devInfo.state.status.value_raw === 5) && (
              //Running
              <div style={Row}>
                <h2 style={txt}>Temps restant:</h2>
                <h2 style={txt}>{devInfo.state.remainingTime[0]}h{devInfo.state.remainingTime[1]}</h2>
              </div>
              )}
              {(devInfo.state.status.value_raw === 2) && (
              //On
              <>
              <div style={Row}>
                <h2 style={txt}>Choisir un programme:</h2>
                <select id="program-select" value={selectedProgram} onChange={changeProgram}style={selectStyle}>
                  <option value="/">Programme</option>
                  <option>Cotons</option>
                  <option>Synthetique</option>
                  <option>Delicat</option>
                  <option>Laine</option>
                  <option>Soie</option>
                  <option>Express 20</option>
                  <option>Chemise</option>
                  <option>Foncé / Jean</option>
                  <option>Eco 40-60</option>
                  <option>Couette</option>
                  <option>Imperméabilisation</option>
                </select>
              </div>
              <div style={Row}>
                <h2 style={txt}>Temps avant lancement :</h2>
                <input type="time"value={heureCible} onChange={handleTimeChange}></input>
              </div>
              <div style={{justifySelf :'center'}}>
                <button style={{...greenButton, height:'10%', width:'100%'}} onClick={savePrgm}>Confirmer</button>
                </div>
              </>
              )}
            </>
            )}
          </div>
        )}
      </div>
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
  width : '90%',
  flexDirection: 'column',
  justifyContent: 'center',
  textAlign : 'left'
}

const selectStyle = { 
  padding: '8px',
  width: '100%',
  maxWidth: '300px' 
}

const Table = {
  width: '97%',
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


/*
Miele washing machine status
1	Off / Arrêt
2	On / Marche
3	Program selected / Programme sélectionné	
4	Waiting for start / En attente de démarrage	
5	Running / En cours	
6	Pause / Pause	
7	End / Fin	
8	Failure / Erreur
9	Programme interrupted / Interrompu
10	Idle / Inactif


ID Programme MieleDescription
1 Cotons (Cottons)Le programme standard pour le linge de lit, serviettes, t-shirts.
2 Synthétique / Froissage minimal (Minimum iron)Pour les fibres synthétiques ou mélangées.
3 Délicat (Delicates)Pour les jupes, chemisiers, textiles fragiles.
4 Laine (Woollens)Cycle très doux pour éviter le feutrage de la laine (lavable en machine).
6 Soie (Silks)Pour les textiles très fragiles contenant de la soie.
7 Express 20 Un cycle ultra-rapide (20 min) pour rafraîchir du linge peu sale.
8 Chemises (Shirts)Réduit le froissage pour faciliter le repassage.
9 Foncé / Jeans (Dark garments / Denim)Protège la couleur des jeans et vêtements sombres.
10 Eco 40-60 Le programme réglementaire européen, optimisé pour l'énergie.
21 Couettes (Down duvets)Pour les grands articles ou duvets en plumes.
23 Imperméabilisation (Proofing)Traitement thermique pour réactiver l'effet déperlant (vêtements de sport).
*/