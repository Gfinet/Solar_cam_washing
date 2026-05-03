import Fastify from 'fastify'
import bcrypt from 'bcrypt'
import 'dotenv/config';

import prisma from './plugins/prisma.js'
import mb from './plugins/modbus_solar.js'
import weather from './plugins/weather.js'

import routes from './routes/index.js'


const customStream = {
  write: (logString) => {
    const log = JSON.parse(logString)
    
    // On définit des couleurs ANSI (comme tes \x1b...)
    const gray = '\x1b[90m'
    const blue = '\x1b[34m'
    const reset = '\x1b[0m'

    // Formatage manuel du message
    if (log.msg) {
      console.log(`${gray}[${new Date(log.time).toLocaleTimeString('fr-FR', {timeZone: 'Europe/Paris'})}]${reset}`,
      `${blue}FASTIFY${reset}: ${log.msg}`)
    }
  }
}


const serverOn = async () => {

    const MieleId = process.env.MIELE_ID;
    const MieleSecret = process.env.MIELE_SECRET;
    // const DbUrl = process.env.DATABASE_URL

    const server = Fastify({logger: {
      level: 'info',
      stream: customStream // On branche ton "intercepteur" ici
    }})

    await server.register(routes, { prefix: '/api' });
    await server.register(prisma);
    await server.register(mb);
    await server.register(weather);
    // await server.register(miele);
    // await server.register(bcrypt.hash)
    

    // fetchSolarData()
    const user = await server.prisma.user.findUnique({ where: { username: "Parents" }})
    if (server.prisma && !user)
    {
        const mdp = await bcrypt.hash("chocolat", 12)
        await server.prisma.User.create({data: {username: "Parents", password_hash: mdp }})
    }
    const washProg = await server.prisma.washing_Program.count();
    if (server.prisma && !washProg)
    {
        for (let i = 0; i < 10; i++)
        {
            await server.prisma.washing_Program.create({
                data: {
                    type: i%3, 
                    time: new Date(),
                    authorId: 1 }})
        }
    }

    server.get('/api', function (request, reply) {
        reply.send({ hello: 'world' })
    })

  return server
}


export default serverOn
