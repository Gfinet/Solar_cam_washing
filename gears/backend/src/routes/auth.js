


export default async function auth(server) {

    server.post('/login', async (request, reply) => {
        const { username, password } = request.body
        const user = await server.prisma.user.findUnique({ where: { username: username }})
        if (user && user.password_hash === password) {
            return { success: true, message: user.username }
        } 
        else 
        {
            reply.code(401)
            return { success: false, message: "Mauvais mot de passe" }
        }
    })
}