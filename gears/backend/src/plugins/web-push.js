import fp from 'fastify-plugin'
import webpush from 'web-push'


export default fp(async (server) => {

	async function webPushPlugin(fastify, options) {
		webpush.setVapidDetails(
			`mailto:${process.env.MAIL}`, // Votre email de contact
			process.env.PUSH_PUBLIC_KEY,
			process.env.PUSH_PRIVATE_KEY
		);
		
		server.decorate('webpush', webpush);
	}

	
//   res.status(200).json({ message: 'Notifications envoyées !' });
})