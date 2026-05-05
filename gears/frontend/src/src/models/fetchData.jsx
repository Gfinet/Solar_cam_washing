const token = localStorage.getItem('token');

export const Fetches = () => {

    const fetchTemp = (setTemp) => {
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
          time : time.getUTCHours() + "h",
          temperature : data.message[i].temp,
          sun  : data.message[i].SolarRay
        }
      }
      setTemp(val);
    })}

    const fetchWatt = (setWatt) => {
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
        let hour = data.message[i].time + 2
        if (hour >= 24)
          hour = hour -24
        const timestr = hour + "h";
        val[i] = {
          time : timestr,
          watt : data.message[i].watts
        }
      }
      setWatt(val);
    })}


    const fetchWashingProg = (setWash) => {
      fetch('/api/wash/list', {
        method: 'POST',
        body: 5,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }})
        .then(res => res.json())
        .then(data => setWash(data.message))
    }

    return {
        fetchTemp,
        fetchWatt,
        fetchWashingProg
    };
}