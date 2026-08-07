import fp from 'fastify-plugin'
import { PrismaClient } from '@prisma/client'




export default fp(async (server) => {
  const prisma = new PrismaClient({ log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },] })
  
  prisma.$on('query', (e) => {
    server.writeLogs(["Prisma"], `PRISMA: ${e.query.substring(0, 100)}`, 
                                 `-Params: ${e.params}`, 
                                 `-Duration: ${e.duration}ms`)
  })
  server.decorate('prisma', prisma)
  server.addHook('onClose', async (server) => {
    await server.prisma.$disconnect()
  })
})