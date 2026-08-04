import { NumberStepper } from "./numberStepper";
import { useState, useRef} from 'react'
import { greenButton, redButton } from "../models/styles";

export function WashInfo({devInfo, selectedDevice, onRefresh})
{

	return (<>
		{(selectedDevice !== "/" && devInfo?.state !== null) ? 
		(<div style={Table}>
			<div style={Row}>
			<h2 style={txt}>Infos:</h2></div>
			<div style={Row}>
			<h2 style={txt}>Status:</h2>
			{(devInfo?.state?.status && devInfo?.state?.remoteEnable?.mobileStart) ? 
			( <h2 style={txt}>{devInfo.state.status.value_localized}</h2> ) :
			( <h2 style={txt}>Option mobile inactive et/ou appuyer sur start</h2> )
			}
			</div> 
			<WashTable devInfo={devInfo} onAction={onRefresh} />

		</div>) 
		: 
		(<>
			<div style={{...Row, alignSelf:'center'}}>
			<h2 style={{color: 'white'}}>No machine picked</h2>
			</div>
		</>)}
	</>)
}


export function WashTable({devInfo, onAction})
{
	// console.log(devInfo, "\n", onAction)
	const state = devInfo?.state
	const status = state?.status
	const machineMode = status?.value_raw;
	const programs = devInfo?.programs
	const devId = devInfo?.ident?.deviceIdentLabel?.fabNumber
	// const startTime = state?.startTime[0] * 60 + state?.startTime[1]
	
	const [delaiH, setDelaiH] = useState(0)
  	const [delaiMin, setDelaiMin] = useState(0)

	const [selectedProgram, setSelectedProgram] = useState('/');
	const changeProgram = (e) => {
		console.log("prgm", e.target.value)
		setSelectedProgram(e.target.value)
		// setSchedule(prev => ({...prev, selectedProgram : e.target.value}))
	}

	const savePrgm = () => {
		if (selectedProgram !== "/")
		{
			console.log("program", selectedProgram ,"added in", delaiH, "H", delaiMin)
		}
		else
		{
			console.log("Aucun programme choisi")
		}
	}

	const fenetreRef = useRef(null);
	const showMiniWindow  = () => { fenetreRef.current.showModal() };
    const closeMiniWindow = () => { fenetreRef.current.close() };
	const PutPause = () =>{ console.log("pause"); closeMiniWindow()}

	const sendAction= async (body) => {
		const token = localStorage.getItem('token');
		const response = await fetch(`/api/miele/devices/${devId}/actions`, {
			method: 'PUT',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json',
      		},
			body : JSON.stringify(body)
    	})
		console.log("REsp", response)
		onAction();
	}

	const turnOn = () => {sendAction({"powerOn": true})}
	const turnOff = () => {sendAction({"powerOff": true})}
	const setProgram = async () => {
		if (selectedProgram == "/") {console.log("No prog");return;}
		const token = localStorage.getItem('token');
		const response = await fetch(`/api/miele/devices/${devId}/programs`, {
			method: 'PUT',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body : JSON.stringify({
				"programId" : parseInt(selectedProgram,10), 
				"startTime": [delaiH,delaiMin]
			})
    	})
		if (response) console.log("RESP", response)
		onAction();
	}

	switch (machineMode) {
		case 1:// Off/Arret
			return (<>
				<h2 style={txt}>Machine Eteinte</h2>
				<button style={{...greenButton, height:'10%', width:'100%'}} onClick={turnOn}>Allumer</button>
				<button style={{...redButton, height:'10%', width:'100%'}} onClick={turnOff}>Eteindre</button>
			</>);
		case 2://On
			return (<>
				<div style={Row}>
					<h2 style={txt}>Choisir un programme:</h2>
					<select id="program-select" value={selectedProgram} onChange={changeProgram} style={selectStyle}>
						<option value="/">Programme</option>
						{programs.map((program) => (
						<option key={program.program} value={program.programId}> 
							{program.program}
						</option>
						))}
					</select>
				</div>
				<div style={Row}>
					<h2 style={txt}>Temps avant lancement :</h2>
					{/* <input type="number" value={heureCible} onChange={handleTimeChange}></input> */}
					<NumberStepper value={delaiH}   onChange={setDelaiH}   max={23} step={1} label="H"   />
					<NumberStepper value={delaiMin} onChange={setDelaiMin} max={59} step={5} label="min" />
				</div>
				<div style={{justifySelf :'center'}}>
					<button style={{...greenButton, height:'10%', width:'100%'}} 
					onClick={setProgram}
					>Confirmer</button>
				</div>
			</>);
		case 4: //Waiting to start
			return (
				<div style={Row}>
					<h2 style={txt}>Temps avant lancement:</h2>
					<h2 style={txt}>{state.startTime[0]}h{state.startTime[1]}</h2>
				</div>
			);
		case 5: //Running
			return (<>
				<div style={Row}>
                  <h2 style={txt}>Programme en cours:</h2>
                  <h2 style={txt}>{state?.ProgramID?.value_localized
}</h2>
                </div>
				<div style={Row}>
                  <h2 style={txt}>Etape:</h2>
                  <h2 style={txt}>{state?.programPhase?.value_localized}</h2>
                </div>
				<div style={Row}>
                  <h2 style={txt}>Temps total restant:</h2>
                  <h2 style={txt}>{state.remainingTime[0]}h
					{state.remainingTime[1] > 10 ? state.remainingTime[1] : "0" + state.remainingTime[1]}</h2>
                </div>
				<div style={{...Row, justifyContent:'center'}}>
					<button style={greenButton} onClick={showMiniWindow}>Pause</button>
					<dialog style={dialogStyle} ref={fenetreRef}>
						<p style={{fontSize: '150%', textAlign: 'center'}}>Mettre en pause?</p>
						<div style={dialogButtonDiv}>
							<button style={openButton} onClick={PutPause}>oui</button>
							<button style={noButton}   onClick={closeMiniWindow}>non</button>
						</div>
					</dialog>
				</div>
			</>);
		// case X:
		// 	return ();
		default:
			return (
				<div style={{...Row, alignSelf:'center'}}>
					<h2 style={{color: 'white'}}>Error</h2>
				</div>
			);
	}
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
  width : '100%',
  height : 'auto'

}

const txt = {
  color:'black',
  fontSize: '15px'
}

const selectStyle = { 
  padding: '8px',
  width: '100%',
}

const dialogStyle = {
    width: '300px',
    height: '150px',
};

const dialogButtonDiv = {
	width: '100%',
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'space-between',
};

const openButton = { ...greenButton, width: '120px', fontSize: '150%', height: '100px' };
const noButton   = { ...redButton,   width: '120px', fontSize: '150%', height: '100px' };

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