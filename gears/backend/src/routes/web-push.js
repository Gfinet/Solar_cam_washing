import fp from 'fastify-plugin';

export default fp(async (server) => {
	// En production, remplacez ce tableau par un appel à votre BDD
	let subscriptions = [];

	// 1. Route pour que le client enregistre son abonnement
	server.post('/subscribe', async (request, reply) => {
		const subscription = request.body;

		// Évite d'ajouter les doublons si l'utilisateur s'abonne plusieurs fois
		const exists = subscriptions.some(s => s.endpoint === subscription.endpoint);
		if (!exists) {
		subscriptions.push(subscription);
		}

		return reply.code(201).send({ message: 'Abonné avec succès !' });
	});

	// 2. Fonction réutilisable pour envoyer un Push (décorée sur l'instance Fastify)
	server.decorate('sendNotif', async (payloadData) => {
		const payload = JSON.stringify(payloadData);

		const promises = subscriptions.map((sub) =>
		server.webpush.sendNotification(sub, payload).catch((err) => {
			if (err.statusCode === 410 || err.statusCode === 404) {
			console.log('Abonnement expiré, suppression...');
			// Supprime l'abonnement expiré du tableau
			subscriptions = subscriptions.filter(s => s.endpoint !== sub.endpoint);
			} else {
			console.error('Erreur Push:', err);
			}
		})
		);

		await Promise.all(promises);
	});

	// 3. Route d'exposé HTTP (si vous voulez tester manuellement via Postman/cURL)
	server.post('/send-notification', async (request, reply) => {
		await server.sendPushNotification({
		title: 'Nouveau message !',
		body: 'Votre machine Miele a terminé son cycle 🧺',
		icon: '/icon.png',
		});

		return { success: true, message: 'Notifications envoyées' };
	});
});

/*

await server.sendPushNotification({
      title: 'Lavage terminé 🧺',
      body: 'Le cycle QuickPowerWash est terminé !',
      icon: '/icon.png',
    });

*/
