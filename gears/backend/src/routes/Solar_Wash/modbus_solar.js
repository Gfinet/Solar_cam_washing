const realTimeRegister = 100;

export default async function modbus(server)
{
    server.get('/mb',  async (request, reply)=>{
        console.log("GET /mb")
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
        console.log("GET /mbtoday")
        try {
            const now = new Date()
            const start = new Date(now.getTime() - (12 * 60 * 60 * 1000))
            // start.setHours(21, 59, 59, 999);

            const today = await server.prisma.Solar_Data.findMany({ where: { hour: {gte : start, lte: now}}, orderBy: {hour: 'asc'}})
            // console.log("Waza",start, end, today)
            const sec = today.map((record, index) => {
                return {
                    id : index, 
                    time : record.hour, 
                    watts : record.Watts,
                    total : record.total
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