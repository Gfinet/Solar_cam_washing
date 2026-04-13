import Fastify from 'fastify'
import prisma from './plugins/prisma.js'
import mb from './plugins/modbus_solar.js'
import routes from './routes/index.js'




const serverOn = async () => {
    const server = Fastify({logger: true})

    await server.register(prisma);
    await server.register(mb);
    await server.register(routes, { prefix: '/api' });

    server.get('/api', function (request, reply) {
        reply.send({ hello: 'world' })
    })

  return server
}


export default serverOn
