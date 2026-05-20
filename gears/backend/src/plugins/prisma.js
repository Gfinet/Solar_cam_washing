import fp from 'fastify-plugin'
import { PrismaClient } from '@prisma/client'




export default fp(async (server) => {
  const prisma = new PrismaClient({ log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },] })
  
  prisma.$on('query', (e) => {
    console.log(`\x1b[90m[${new Date().toLocaleTimeString('fr-FR', {timeZone: 'Europe/Paris'})}]\x1b[0m \x1b[35mPRISMA\x1b[0m: ${e.query.substring(0, 100)}`)
    console.log(`\x1b[36m-Params\x1b[0m: ${e.params}`)
    console.log(`\x1b[36m-Duration\x1b[0m: ${e.duration}ms`)
  })
  server.decorate('prisma', prisma)
  server.addHook('onClose', async (server) => {
    await server.prisma.$disconnect()
  })
})