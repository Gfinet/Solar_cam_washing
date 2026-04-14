import Fastify from 'fastify'
import prisma from './plugins/prisma.js'
import mb from './plugins/modbus_solar.js'
import routes from './routes/index.js'




const serverOn = async () => {
    const server = Fastify()//{logger: true}

    await server.register(routes, { prefix: '/api' });
    await server.register(prisma);
    await server.register(mb);

    // fetchSolarData()
    const user = await server.prisma.user.findUnique({ where: { username: "parents" }})
    if (server.prisma && !user)
        await server.prisma.User.create({data: {username: "parents", password_hash: "chocolat" }})

    server.get('/api', function (request, reply) {
        reply.send({ hello: 'world' })
    })

  return server
}


export default serverOn
