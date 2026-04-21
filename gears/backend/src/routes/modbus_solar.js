const realTimeRegister = 100;

export default async function modbus(server)
{
    server.get('/mb',  async (request, reply)=>{
        try {
            const response = await server.mb.readInputRegisters(realTimeRegister, 2)

            const buffer = response.response.body.valuesAsBuffer;
            const power = buffer.readUInt32BE(0)
    
            console.log(`Production : ${power} Watts`)
            return {success : true, message: power}
        }
        catch (err)
        {
            console.error("erreur :", err)
            return {success : false, message: 0}
        }
    });

    server.get('/mbtoday', async (request,reply) =>{
        const now = new Date()
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
        start.setHours(21, 59, 59, 999);

        const today = await server.prisma.Solar_Data.findMany({ where: { hour: {gte : start, lte: now}}, orderBy: {hour: 'asc'}})
        // console.log("Waza",start, end, today)
        const hourMid = [];
        const sec = []
        let hour = -1;
        let mid = 0;
        let j = 1;
        let countPerHour = 0
        for (let i=0; i< today.length; i++)
        {
            const tmz = new Date(today[i].hour)
            if (hour !== tmz.getHours())
            {
                if (mid !== 0 && countPerHour !== 0) hourMid.push({id : j, time : hour, watts : mid / countPerHour})
                else if (mid !== 0 && countPerHour === 0) hourMid.push({id : j, time : hour, watts : 0})
                mid = 0;
                countPerHour = 0;
                hour = tmz.getHours()
                j++;
            }
            mid += today[i].Watts;
            countPerHour++;
            sec.push({id : i, time : today[i].hour, watts : today[i].Watts})
        }
        if (mid !== 0 && countPerHour !== 0) hourMid.push({id : j, time : hour, watts : mid / countPerHour})
        else hourMid.push({id : j, time : hour, watts : 0})
        // return {success : true, message: hourMid}
        return {success : true, message: sec}
    })
}