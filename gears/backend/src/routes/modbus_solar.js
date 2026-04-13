import fp from 'fastify-plugin' // Aide à rendre prisma accessible partout
import Modbus from 'jsmodbus'
import net from 'net'




export default async function modbus(server)
{
    server.get('/mb',  async (request, reply)=>{
        console.log('connecté à l\'ondulateur')
        try {
            const response = await server.mb.readInputRegisters(30775, 2)

            const puissance = response.response.body.valuesAsBuffer.readUInt32BE(0)
            console.log(`Production :, ${puissance} Watts`)
        }
        catch (err)
        {
            console.error("erreur :", err)
        }
        return puissance
    })
}