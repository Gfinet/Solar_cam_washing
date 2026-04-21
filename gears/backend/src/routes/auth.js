import bcrypt from 'bcrypt'


export default async function auth(server) {

    server.post('/login', async (request, reply) => {
        const { username, password } = request.body
        const user = await server.prisma.user.findUnique({ where: { username: username }})
        if (user)
        {
            if (bcrypt.compare(user.password_hash, password))
                return { success: true, message: username }
            else 
            {
                reply.code(401)
                return { success: false, message: "Mauvais mot de passe" }
            }
        }
        else
            return { success: false, message: "Utilisateur inexistant" }
        
    })
}

// fastify.bcrypt.hash('password')
//   .then(hash => fastify.bcrypt.compare('password', hash))
//   .then(match => console.log(match ? 'Matched!' : 'Not matched!'))
//   .catch(err => console.error(err.message))
