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
    })
}