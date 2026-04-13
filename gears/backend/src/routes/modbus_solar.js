

export default async function modbus(server)
{
    server.get('/mb',  async (request, reply)=>{
        console.log('connecté à l\'ondulateur')
        try {
            const response = await server.mb.readInputRegisters(100, 2)

            const buffer = response.response.body.valuesAsBuffer;
            const power = buffer.readUInt32BE(0)
    
            console.log(`Production : ${power} Watts`)
            return {success : true, message: power}
        }
        catch (err)
        {
            console.error("erreur :", err)
            return {success : false, message: "fail to log"}
        }
    })
}