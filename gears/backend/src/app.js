import Fastify from 'fastify'
import pkg from '@prisma/client';



const fastify = Fastify({
  logger: true
})

const { PrismaClient } = pkg;
const prisma = new PrismaClient({ log: ["query", "info"] })

prisma.$on("query", (e) => {
  console.log(e);
});

// const countUsers = await prisma.user.count({})
// console.log(countUsers)

// Declare a route
fastify.get('/api', function (request, reply) {
  reply.send({ hello: 'world' })
})


// Connexion à la DB au démarrage du serveur
const start = async () => {
  try {

    console.log("server listening on localhost:3000")
    await fastify.listen({ port: 3000, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

fastify.post('/api/login', async (request, reply) => {
    const { username, password } = request.body

    const user = await prisma.user.findUnique({
        where: { username: username },
        })
    
    if (user && user.password_hash === password) {
        return { success: true, message: user.username }
    } else {
        reply.code(401)
        return { success: false, message: "Mauvais mot de passe" }
    }
})

// Une route pour tester si la DB répond
fastify.get('/api/db-test', async (request, reply) => {
  const res = await client.query('SELECT NOW()') // Demande l'heure à la DB
  return { now: res.rows[0] }
})

start()