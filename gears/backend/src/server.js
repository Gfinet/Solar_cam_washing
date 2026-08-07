import Fastify from 'fastify'
import bcrypt from 'bcrypt'
import fastifyJwt from '@fastify/jwt';
import 'dotenv/config';

import prisma from './plugins/prisma.js'
import mb from './plugins/Solar_Wash/modbus_solar.js'
import miele from './plugins/Solar_Wash/mieleWashing.js'
import weather from './plugins/Solar_Wash/weather.js'
import clim from './plugins/Clim/ClimHandler.js'
import jwt from './plugins/jwt_auth.js'
import webpush from './plugins/web-push.js'
import ezviz from './plugins/Door_Cams/ezviz_cam.js'

import fs from 'fs'; //Logs
import path from 'path';
import util from 'util';

import routes from './routes/index.js'


const logsFile = ["Server.log", "Prisma.log", "Miele.log", "Request.log", "Error.log", "Test.log"]
    const logsFd = Object.fromEntries(
      logsFile.map(name => [name.slice(0, -4), fs.openSync(path.join(process.cwd(), 'src', 'logs', name), 'a')]))

const customStream = {
  write: (logString) => {
    const log = JSON.parse(logString)
    
    // On définit des couleurs ANSI (comme tes \x1b...)
    const gray = '\x1b[90m'
    const blue = '\x1b[34m'
    const reset = '\x1b[0m'

    // Formatage manuel du message
    if (log.msg) {
        fs.writeSync(logsFd["Server"], `[${new Date(log.time).toLocaleString('fr-FR', {timeZone: 'Europe/Paris'})}] FASTIFY: ${log.msg}\n`)
    }
  }
}


const serverOn = async () => {

    const server = Fastify({logger: {
      level: 'info',
      stream: customStream // On branche ton "intercepteur" ici
    }})

    const logsDir = path.join(process.cwd(), 'src', 'logs');
    fs.mkdirSync(logsDir, { recursive: true });
    
    server.decorate('logFd', logsFd);
    // console.log(server.logFd)

    server.decorate('writeLogs', (fds, ...args) => {
      fds.map(fd => {
        const timestamp = new Date().toLocaleString('fr-FR', {timeZone: 'Europe/Paris'});
        const formattedMessage = util.format(...args);
        const output = `[${timestamp}] ${formattedMessage}\n`;
        
        fs.writeSync(server.logFd[fd], output);
      });
    })

    await server.register(fastifyJwt, {secret: process.env.JWT_SECRET });


    await server.register(jwt);
    await server.register(routes, { prefix: '/api' });
    await server.register(prisma);
    await server.register(mb);
    await server.register(weather);
    await server.register(webpush);
    await server.register(miele); // TODO: trouver l'ID Midea
    await server.register(clim); // TODO: trouver l'ID Midea
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
