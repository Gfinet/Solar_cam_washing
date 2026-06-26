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
        const sid = data?.result?.sid
        return sid
    }
    const getValuesSMA = async (sid) => {
        try {
            console.log("SID", sid)
            if (sid === null) return {err : 1}
            const response = await fetch(`http://192.168.0.194/dyn/getValues.json?sid=${sid}`, {
                method : 'POST',
                headers : {"Content-Type": "application/json"},
                body : JSON.stringify({"destDev":[],"keys":["6100_40263F00", "6400_00262200", "6380_40251E00"]})
            })
            // console.log("RESP ", response)
            // console.log("---")
            const data = await response.json();
            
            if (data.err) return data
            console.log("DATA ", data.result[process.env.SMA_ID]["6100_40263F00"]['1'])
            //La puissance instantanée
            console.log("DATA ", data.result[process.env.SMA_ID]["6400_00262200"]['1'])
            //Le rendement du jour
            /*
            DATA  {
                '0156-76BCCE5E': {
                    '6100_40263F00': { '1': [Array] },
                    '6400_00262200': { '1': [Array] },
                    '6380_40251E00': { '1': [Array] }
                    }
                }
            */
        // console.log("volt")
            const volt = data.result[process.env.SMA_ID]["6100_40263F00"]["1"];
            const Val = {
                total : data.result[process.env.SMA_ID]["6400_00262200"]["1"][0].val,
                instant : data.result[process.env.SMA_ID]["6100_40263F00"]["1"][0].val,
                // volt : [volt[0].val, volt[1]]
            }
            // console.log("Val", Val)
            return Val
        } catch (error) {
            // console.log("ERROR", error)
            console.error('Erreur lors de la connexion SMA:\n\t', error.cause.message);
            return null
        }
    }

    let sid = null
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const count = await server.prisma.solar_Data.findMany({where: {hour: {gte: todayStart}}});
      
    // Lance le fetch initial sans bloquer l'initialisation du plugin
    fetchSolarData(server).catch(err => console.error('Fetch solaire initial échoué:', err.cause.message));

    cron.schedule('*/5 * * * *', async () => {
        fetchSolarData(server).catch(err => console.error('Fetch solaire échoué:', err.cause.message));
    })

    async function fetchSolarData(server)
    {
        try {
            const lastRecord = await server.prisma.Solar_Data.findFirst({orderBy: { hour: 'desc' } })
            
            // console.log("WATT", lastWatt, lastRecord)

            let data = await getValuesSMA(sid);
            console.log("first check", data)
            // if(!data)   return;
            if(data.err)
            {
                sid = await connectSMA();
                // console.log("sid", sid)
                data = await getValuesSMA(sid);
            }

            await server.prisma.Solar_Data.create({data: {Watts: data.instant || 0 }})
        } 
        catch (error) {
            console.error('Erreur lors du fetch solaire:', error);
        } 
    }
})

