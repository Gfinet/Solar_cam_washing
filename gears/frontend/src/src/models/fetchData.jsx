export const Fetches = () => {

  ////Open-meteo
  const fetchTemp = (setTemp) => {
    const token = localStorage.getItem('token');
      fetch('/api/temptoday',{
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
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
        time : time.toLocaleString('fr-BE', { hour: '2-digit', timeZone: 'Europe/Brussels' }), //getUTCHours() + "h",
        temperature : data.message[i].temp,
        sun  : data.message[i].SolarRay
      }
    }
    setTemp(val);
  })}

  ////Sunny-boy Onduleur
  const fetchWatt = (setWatt) => {
    const token = localStorage.getItem('token');
    fetch('/api/mbtoday',{
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
  }})
  .then(res => res.json())
  .then(data => {
    const val = Array(data.message.length)
    for (let i=0; i<data.message.length; i++)
    {
      let hour = data.message[i].time.toLocaleString('fr-BE', { hour: '2-digit', timeZone: 'Europe/Brussels' })
      val[i] = {
        time : hour,
        watt : data.message[i].watts
      }
    }
    setWatt(val);
  })}

  ////Db Washing Prog
  const fetchWashingProg = (setWash) => {
    const token = localStorage.getItem('token');
    fetch('/api/wash/list', {
      method: 'POST',
      body: 5,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    }).then(res => res.json())
    .then(data => {setWash(data.message)})
  }

  ////Miele devices
  const fetchWashDevices = (setDevices) => {
    const token = localStorage.getItem('token');
    fetch('/api/miele/devices', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res =>res.json())
    .then(data => {setDevices(data)})//; console.log("DEVICES",data)})
    }

  const fetchDevInfo = (setDevInfo, device) => {
    const token = localStorage.getItem('token');
    fetch(`/api/miele/device/${device}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res =>res.json())
    .then(data => {setDevInfo(data); console.log("DEV",data)})
    }

  return {
    fetchTemp,
    fetchWatt,
    fetchWashingProg, 
    fetchWashDevices,
    fetchDevInfo
  };
}