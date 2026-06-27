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
        try {
            const now = new Date()
            const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
            start.setHours(21, 59, 59, 999);

            const today = await server.prisma.Solar_Data.findMany({ where: { hour: {gte : start, lte: now}}, orderBy: {hour: 'asc'}})
            // console.log("Waza",start, end, today)
            const sec = today.map((record, index) => {
                return {
                    id : index, 
                    time : record.hour, 
                    watts : record.Watts
                }
            })

            return {success : true, message: sec}
        } 
        catch (error) {
            console.error("erreur :", err)
            return {success : false, message: 0}
        }
    })
}