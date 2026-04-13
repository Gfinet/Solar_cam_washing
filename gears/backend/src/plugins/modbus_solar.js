import fp from 'fastify-plugin' // Aide à rendre prisma accessible partout
import Modbus from 'jsmodbus'
import net from 'net'



export default fp(async (server) => {
    const option = {'host' : "10.19.1.163" /*ip ondulateur*/, 'port' : 5020} //10.19.1.163
    const socket = new net.Socket()
    const mb = new Modbus.client.TCP(socket)
    socket.connect(option)

    server.decorate('mb', mb)
    socket.on('error', (err) => {
        console.error("Error Socket Modbus:", err.message)
    })
    server.addHook('onClose', async (server) => {
        socket.end()
    })
})

