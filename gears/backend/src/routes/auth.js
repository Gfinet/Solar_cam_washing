import bcrypt from 'bcrypt'


export default async function auth(server) {

    server.post('/login', async (request, reply) => {
        const { username, password } = request.body
        const user = await server.prisma.user.findUnique({ where: { username: username }})
        const mdp = await bcrypt.hash(password, 12)
        console.log(mdp, password, user.password_hash)
        if (user && user.password_hash === mdp) {
            return { success: true, message: user.username }
        } 
        else 
        {
            reply.code(401)
            return { success: false, message: "Mauvais mot de passe" }
        }
    })
}

// fastify.bcrypt.hash('password')
//   .then(hash => fastify.bcrypt.compare('password', hash))
//   .then(match => console.log(match ? 'Matched!' : 'Not matched!'))
//   .catch(err => console.error(err.message))
