import fp from 'fastify-plugin'
import { PrismaClient } from '@prisma/client'




export default fp(async (server) => {
  const prisma = new PrismaClient({ log: ["query", "error"] })
  
  server.decorate('prisma', prisma)
  server.addHook('onClose', async (server) => {
    await server.prisma.$disconnect()
  })
})