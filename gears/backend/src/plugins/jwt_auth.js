import fp from 'fastify-plugin'
import fastifyJwt from '@fastify/jwt';



export default fp (async (server) => {
	server.decorate('auth', async (request, reply) => {
		try {
			await request.jwtVerify();
		} 
		catch (error) {
			reply.status(401).send({ error: "Non autorisé : Token invalide ou manquant" });
		}
	})
})


