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
        try {
            const response = await fetch(`http://192.168.0.194/dyn/getValues.json?sid=${sid}`, {
                method : 'POST',
                headers : {"Content-Type": "application/json"},
                body : JSON.stringify({"destDev":[],"keys":["6100_40263F00", "6400_00262200", "6380_40251E00"]})
            })
            console.log("RESP ", response)
            const data = await response.json();
            console.log("DATA ", process.env.SMA_ID, data.result)
        } catch (error) {
            console.error('Erreur lors de la connexion SMA:\n\t', error.cause.message);
            return null
        }
        
        
        /*
        DATA  {
            '0156-76BCCE5E': {
                '6100_40263F00': { '1': [Array] },
                '6400_00262200': { '1': [Array] },
                '6380_40251E00': { '1': [Array] }
                }
            }
        */
        if (data.err)
            return data
        const volt = data.result[process.env.SMA_ID]["6100_40263F00"]["1"];
        const Val = {
            total : data.result[process.env.SMA_ID]["6400_00262200"]["1"][0].val,
            instant : data.result[process.env.SMA_ID]["6100_40263F00"]["1"][0].val,
            volt : [volt[0].val, volt[1]]
        }
        console.log("Val", Val)
        return Val
    }

    let sid = null
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const count = await server.prisma.solar_Data.findMany({where: {hour: {gte: todayStart}}});
      
    // Lance le fetch initial sans bloquer l'initialisation du plugin
    fetchSolarData(server).catch(err => console.error('Fetch solaire initial échoué:', err.cause.message));

    cron.schedule('0 * * * *', async () => {
        fetchSolarData(server).catch(err => console.error('Fetch solaire échoué:', err.cause.message));
    })

    async function fetchSolarData(server)
    {
        try {
            const lastRecord = await server.prisma.Solar_Data.findFirst({orderBy: { hour: 'desc' } })
            const lastWatt = lastRecord?.total || 0
            
            console.log("WATT", lastWatt, lastRecord)

            let data = await getValuesSMA(sid);
            if(!data)   return;
            if(data.err)
            {
                sid = await connectSMA();
                console.log("sid", sid)
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

