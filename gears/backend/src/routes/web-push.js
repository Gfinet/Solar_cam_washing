import fp from 'fastify-plugin'


export default fp ( async (server) =>{

	let subscriptions = [];

    server.post('/subscribe', (req, res) => {
		const subscription = req.body;
		subscriptions.push(subscription);
		res.status(201).json({ message: 'Abonné avec succès !' });
	});

	// Route pour déclencher et envoyer une notification
	server.post('/send-notification', async (req, res) => {
		const notificationPayload = JSON.stringify({
			title: 'Nouveau message !',
			body: 'Votre machine Miele a terminé son cycle 🧺',
			icon: '/icon.png',
		});
	})
	
	const promises = subscriptions.map(sub =>
		server.webpush.sendNotification(sub, payload).catch(err => {
			// 410 = L'utilisateur s'est désabonné ou a supprimé le permission
			if (err.statusCode === 410) console.log('Abonnement expiré, à supprimer de la BDD');
			else console.error('Erreur Push:', err);
		})
  	);

	await Promise.all(promises);
	return { success: true, message: 'Notifications envoyées' };
})