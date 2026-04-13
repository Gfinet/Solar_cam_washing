import fp from 'fastify-plugin' // Aide à rendre prisma accessible partout
import Modbus from 'jsmodbus'
import net from 'net'



export default fp(async (server) => {
    const option = {
        'host' : "192.168.122.1", //ip ondulateur 
        'port' : 5020
    }
    const socket = new net.Socket()
    const mb = new Modbus.client.TCP(socket)
    socket.connect(option)
    
    server.decorate('mb', mb)
    server.addHook('onClose', async (server) => {
        socket.end()
    })
})

