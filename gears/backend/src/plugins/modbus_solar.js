import fp from 'fastify-plugin'
import Modbus from 'jsmodbus'
import cron from 'node-cron';

// host = ifconfig | grep 192/10 | awk '{print $2}'
const realTimeRegister = 100;

export default fp (async (server) =>
{    
     const connectSMA = async () => {
        const response = await fetch('http://192.168.0.194/dyn/login.json', {
            method : 'POST',
            headers : {"Content-Type": "application/json"},
            body : JSON.stringify({"pass":"6969","right":"usr"})
        })
        const data = await response.json();
        const sid = data.result.sid
        return sid
    }
    const getValuesSMA = async (sid) => {
        const response = await fetch(`http://192.168.0.194/dyn/getValues.json?sid=${sid}`, {
            method : 'POST',
            headers : {"Content-Type": "application/json"},
            body : JSON.stringify({"destDev":[],"keys":["6100_40263F00", "6400_00262200", "6380_40251E00"]})
        })
        const data = await response.json();
        if (data.err)
            return data
        const volt = data.result[process.env.SMA_ID]["6100_40263F00"]["1"];
        const Val = {
            total : data.result[process.env.SMA_ID]["6400_00262200"]["1"][0].val,
            instant : data.result[process.env.SMA_ID]["6100_40263F00"]["1"][0].val,
            volt : [volt[0].val, volt[1].val]
        }
        return Val
    }

    let sid = null
    const count = await server.prisma.weather_Forecast.count();
    if (count === 0)
        await fetchSolarData(server);
    
    cron.schedule('0 * * * *', async () => {
        await fetchSolarData(server);
    })

    async function fetchSolarData(server)
    {
        try {
            const lastRecord = await server.prisma.Solar_Data.findFirst({orderBy: { timestamp: 'desc' } })
            const lastWatt = lastRecord?.total || 0

            let data = await getValuesSMA(sid);
            if(!data || data.err)
            {
                sid = await connectSMA();
                data = await getValuesSMA(sid);
            }

            let currentTotal = data?.total || lastWatt;
            let productionDeLHeure = (currentTotal < lastWatt) ? currentTotal : currentTotal - lastWatt || 0;

            await server.prisma.Solar_Data.create({data: {Watts: productionDeLHeure, total : currentTotal }})
        } 
        catch (error) {
            console.error('Erreur lors du fetch solaire:', error);
        } 
    }
})


// fp1(async (server) => {
//     const option = {'host' : "192.168.0.230" /*ip ondulateur*/, 'port' : 5020} //502
//     const socket = new net.Socket()
//     const mb = new Modbus.client.TCP(socket)
//     let timer;
//     socket.connect(option)

//     server.decorate('mb', mb)
//     socket.on('connect', () => {console.log('connecté à l\'ondulateur')})
//     socket.on('error', (err) => {console.error("Error Socket Modbus:", err.message)})
//     server.addHook('onClose', async (server) => {
//         socket.end();
//         clearInterval(timer)
//     })
//     async function fetchSolarData()
//     {
//         if (socket.readyState !== 'open')
//             socket.connect(option)
        
//         let power = -1;
//         try {
//             const response = await server.mb.readInputRegisters(realTimeRegister, 2)

//             const buffer = response.response.body.valuesAsBuffer;
//             power = buffer.readUInt32BE(0)
    
//             console.log(`Production : ${power} Watts`)
//             // return {success : true, message: power}
//         }
//         catch (err)
//         {
//             console.error("erreur :", err)
//             // return {success : false, message: 0}
//         }
//         if (socket.readyState === 'open' && power > 0)
//             await server.prisma.Solar_Data.create({data: {Watts: power }})
//     }
//     // timer = setInterval(fetchSolarData, 1000)
// })

