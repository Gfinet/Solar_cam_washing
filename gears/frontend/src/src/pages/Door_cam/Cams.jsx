import { useState, useEffect, useRef } from 'react'
import { MyCam } from '../../models/myCam';
import { AppNavigation } from '../../models/navigation';
import { Fetches } from '../../models/fetchData';

import '../../App.css'


function Cams()
{
    const getCameras = async () => {
        const response = await fetch('/go2rtc/api/streams');
        const data = await response.json();
        console.log(data)
        // data ressemblera à : [{ "name": "garage", "status": "online", ... }, { "name": "maison", ... }]
        return data;
    };
    const streamGarage  = "/go2rtc/webrtc.html?src=garage&mode=ws";
    const streamSonette = "/go2rtc/webrtc.html?src=sonette&mode=ws";
    const {goToDash} = AppNavigation();

    const fenetreRef = useRef(null);
    const showMiniWindow = () => {fenetreRef.current.showModal()}
    const OpenDoor = () => {console.log("Porte ouverte");closeMiniWindow()};
    const closeMiniWindow = () => {fenetreRef.current.close()}


    return (
        <div style={styles.globalDiv}>
            <button style={{...blueButton, alignSelf:'center'}} onClick={goToDash}>Revenir à l'acceuil</button>
            <p style={styles.title}>🔴 Garage</p>
            <MyCam source={streamGarage}/>
            <p style={styles.title}>🔴 Sonette</p>
            <MyCam source={streamSonette}/>

            <div style = {styles.buttonDiv}>
                <button style={greenButton} onClick={showMiniWindow}>Ouvrir la porte</button>
                <dialog style={styles.miniWindowDial} ref={fenetreRef}>
                    <p style = {{fontSize:'150%'}} >Ouvrir la porte?</p>
                    <div style = {styles.buttonWindowDiv}>
                        <button style = {openButton} onClick={OpenDoor}>oui</button>
                        <button style = {NoButton} onClick={closeMiniWindow}>non</button>
                    </div>
                </dialog>
                <button style={{...blueButton, alignSelf: 'center'}} onClick={goToDash}>Revenir à l'acceuil</button>
            </div>
        </div>
  );
}

const styles = {
    globalDiv:{
        width: '100%', 
        maxWidth: '800px', 
        margin: '20px auto', 
        gap:'1rem', 
        display: 'flex',
        flexDirection : 'column',
    },
    title :{ 
        textAlign: 'center', 
        marginTop: '10px', 
        color: '#666' 
    },
    buttonDiv: {
        display: 'flex',
        flexDirection : 'row',
        gap: '1rem',
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: { 
        padding: '30px',
        // maxFontSize: '100%',
        color: 'black', 
        border: 'none', 
        borderRadius: '5px', 
        cursor: 'pointer',
    },
    miniWindowDial: {
        width: '300px',
        height: '150px'
    },
    buttonWindowDiv : {
        width: '100%',
        display: 'flex',
        flexDirection:'row',
        justifyContent: 'space-between'
    },

};


const greenButton = {...styles.button, background:'#00ff33'};
const redButton = {...styles.button, background:'#ff0000ff'};
const blueButton = {...styles.button, background: '#007bff'};

const openButton = {...greenButton, witdh:'250px', fontSize:'150%',  height:'100px'}
const NoButton = {...redButton, witdh:'250px', fontSize:'150%', height:'100px'}

export default Cams
