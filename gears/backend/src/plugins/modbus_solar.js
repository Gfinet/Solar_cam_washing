import fp from 'fastify-plugin' // Aide à rendre prisma accessible partout
import Modbus from 'jsmodbus'
import net from 'net'



export default fp(async (server) => {
    const option = {
        'host' : "0.0.0.0", //ip ondulateur 
        'port' : 'xxx'
    }
    const socket = new net.Socket(option)
    const mb = new Modbus.client.TCP(socket)
    
    server.decorate('mb', mb)
    server.addHook('onClose', async (server) => {
        await server.mb.$disconnect()
    })
})

