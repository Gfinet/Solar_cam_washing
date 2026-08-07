import fp from 'fastify-plugin'
import cron from 'node-cron';


export default fp (async (server) =>
{    
     const connectSMA = async () => {
        const response = await fetch('http://192.168.0.194/dyn/login.json', {
            method : 'POST',
            headers : {"Content-Type": "application/json"},
            body : JSON.stringify({"pass":Sma.Psw,"right":Sma.Usr})
        })
        const data = await response.json();
        const sid = data?.result?.sid
        return sid
    }
    const getValuesSMA = async (sid) => {
        try {
            server.writeLog(server.logFd["Server.log"], "SID", sid)
            if (sid === null) return {err : 1}
            const response = await fetch(`http://192.168.0.194/dyn/getValues.json?sid=${sid}`, {
                method : 'POST',
                headers : {"Content-Type": "application/json"},
                body : JSON.stringify({"destDev":[],"keys":[Sma.Day, Sma.Instant]})
            })

            const data = await response.json();
            
            if (data.err) return data
            // server.writeLog(server.logFd["Test.log"], "Instant Sma ", data.result[Sma.Id][Sma.Instant]['1'])
            // server.writeLog(server.logFd["Test.log"], "Day     Sma ", data.result[Sma.Id][Sma.Day]['1'])

            const Val = {
                total : data.result[Sma.Id][Sma.Day]["1"][0].val,
                instant : data.result[Sma.Id][Sma.Instant]["1"][0].val,
                total : data.result[Sma.Id][Sma.Day]["1"][0].val,
            }
            return Val
        } catch (error) {
            server.writeLog(server.logFd["Error.log"], 'Erreur lors de la connexion SMA:\n\t', error.cause.message);
            return null
        }
    }

    const Sma = {
        Id : process.env.SMA_ID,
        Instant : process.env.SMA_INSTANT,
        Day : process.env.SMA_DAY,
        Usr : process.env.SMA_USR,
        Psw : process.env.SMA_PSW
    }

    let sid = null

    cron.schedule('*/5 * * * *', async () => {
        fetchSolarData(server).catch(err => server.writeLog(server.logFd["Error.log"], 'Fetch solaire échoué:', err.cause.message));
    })

    async function fetchSolarData(server)
    {
        try {

            let data = await getValuesSMA(sid);
            let count = 0;
            while (data.err)
            {
                //if sid expired or no sid
                sid = await connectSMA();
                data = await getValuesSMA(sid);
                count++
                if (count >5)
                    throw Error("Cant connect")
            }

            await server.prisma.Solar_Data.create(
                {data: {
                    Watts: data.instant || 0, 
                    total :data.total || 0 
                }})
        } 
        catch (error) {
            server.writeLog(server.logFd["Error.log"], 'Erreur lors du fetch solaire:', error);
        } 
    }
})

