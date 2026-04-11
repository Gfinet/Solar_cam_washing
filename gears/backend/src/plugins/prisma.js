import fp from 'fastify-plugin' // Aide à rendre prisma accessible partout
import { PrismaClient } from '@prisma/client'

export default fp(async (server) => {
  const prisma = new PrismaClient({ log: ["query", "info"] })
  
  // On "décore" l'instance pour pouvoir faire server.prisma partout
  server.decorate('prisma', prisma)

  // On ferme la connexion proprement quand le serveur s'arrête
  server.addHook('onClose', async (server) => {
    await server.prisma.$disconnect()
  })
})