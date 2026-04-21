import Fastify from 'fastify'
import bcrypt from 'bcrypt'
import prisma from './plugins/prisma.js'
import mb from './plugins/modbus_solar.js'
import weather from './plugins/weather.js'

import routes from './routes/index.js'





const serverOn = async () => {
    const server = Fastify()//{logger: true}

    await server.register(routes, { prefix: '/api' });
    await server.register(prisma);
    await server.register(mb);
    await server.register(weather);
    // await server.register(bcrypt.hash)
    

    // fetchSolarData()
    const user = await server.prisma.user.findUnique({ where: { username: "Parents" }})
    if (server.prisma && !user)
    {
        const mdp = await bcrypt.hash("chocolat", 12)
        await server.prisma.User.create({data: {username: "Parents", password_hash: mdp }})
    }

    server.get('/api', function (request, reply) {
        reply.send({ hello: 'world' })
    })

  return server
}


export default serverOn
