import fp from 'fastify-plugin' // Aide à rendre prisma accessible partout
import Modbus from 'jsmodbus'
import net from 'net'

// host = ifconfig | grep 192/10 | awk '{print $2}'
const realTimeRegister = 100;

export default fp(async (server) => {
    const option = {'host' : "192.168.0.230" /*ip ondulateur*/, 'port' : 5020} //10.19.1.163
    const socket = new net.Socket()
    const mb = new Modbus.client.TCP(socket)
    let timer;
    socket.connect(option)

    server.decorate('mb', mb)
    socket.on('connect', () => {console.log('connecté à l\'ondulateur')})
    socket.on('error', (err) => {console.error("Error Socket Modbus:", err.message)})
    server.addHook('onClose', async (server) => {
        socket.end();
        clearInterval(timer)
    })
    async function fetchSolarData()
    {
        if (socket.readyState !== 'open')
            socket.connect(option)
        
        let power = -1;
        try {
            const response = await server.mb.readInputRegisters(realTimeRegister, 2)

            const buffer = response.response.body.valuesAsBuffer;
            power = buffer.readUInt32BE(0)
    
            console.log(`Production : ${power} Watts`)
            // return {success : true, message: power}
        }
        catch (err)
        {
            console.error("erreur :", err)
            // return {success : false, message: 0}
        }
        if (socket.readyState === 'open' && power > 0)
            await server.prisma.Solar_Data.create({data: {Watts: power }})
    }
    // timer = setInterval(fetchSolarData, 1000)
})

