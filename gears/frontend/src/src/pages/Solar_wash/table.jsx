import { useState, useEffect } from 'react'
import { MyLineChart, MyBarChart, TimeSlider } from '../../models/charts'
import { AppNavigation } from '../../models/navigation';
import { Fetches } from '../../models/fetchData';
import { globalDiv, buttonDiv, chartDiv, blueButton, greyButton } from '../../models/styles';

import '../../App.css'



function Table() {
  const {goToDash, goToSchedule, Logout} = AppNavigation();
  const {fetchTemp, fetchWatt} = Fetches()
  
  const [temp, setTemp] = useState([]);
  const [watt, setWatt] = useState([]);

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
  }, []);

  const tempSlice = temp.slice(
    Math.max(0, tempCenter - WINDOW),
    Math.min(temp.length, tempCenter + WINDOW + 1)
  );
  const wattSlice = watt.slice(
    Math.max(0, wattCenter - WINDOW),
    Math.min(watt.length, wattCenter + WINDOW + 1)
  );

  const c = "#fbbf24"
  const chartData = {
        //title       data     valx      valy              unit
    w : {t : "Meteo", d: tempSlice, x:"time", y: "temperature", u:'°'},
    e : {t : "Electricite des panneaux", d: wattSlice, x:"time", y: "watt", u:'w', tt: watt.total},
    r : {t : "Rayonnement solaire", d: tempSlice, x:"time", y: "sun", u:'w/m2'}
  }

  return (
    <div style={globalDiv}>
      <h1>Bienvenue sur l'espace Parents</h1>
      <div style={buttonDiv}>
        <button style={blueButton} onClick={goToDash}>Revenir à l'acceuil</button>
        <button style={blueButton} onClick={goToSchedule}>Prevoir une machine</button>
        <button style={greyButton} onClick={Logout}>Se Déconnecter</button>
      </div>

      <TimeSlider
        data={watt} center={wattCenter}
        onCenterChange={setWattCenter} windowSize={WINDOW}
        label="Électricité panneaux"
      />
      
      <div style={chartDiv}>
        <MyBarChart  title={chartData.w.t} data={chartData.w.d} valx={chartData.w.x} valy={chartData.w.y} unit={chartData.w.u} color={c} />
        <MyLineChart title={chartData.e.t} data={chartData.e.d} valx={chartData.e.x} valy={chartData.e.y} unit={chartData.e.u} color={c} total={chartData.e.t}/>
      </div>

      <TimeSlider
        data={temp} center={tempCenter}
        onCenterChange={setTempCenter} windowSize={WINDOW}
        label="Météo & Rayonnement"
      />

      <div style={chartDiv}>
        <MyBarChart title={chartData.r.t} data={chartData.r.d} valx={chartData.r.x} valy={chartData.r.y} unit={chartData.r.u} color={c} />
        <MyBarChart title={chartData.r.t} data={chartData.r.d} valx={chartData.r.x} valy={chartData.r.y} unit={chartData.r.u} color={c} />
      </div>
    </div>
  );
}




export default Table
