import fp from 'fastify-plugin';

export default fp(async (server) => {
	// En production, remplacez ce tableau par un appel à votre BDD
	// let subscriptions = [];

	// console.log("sub", subscriptions)
	// 1. Route pour que le client enregistre son abonnement
	server.post('/subscribe',
	{ preHandler: [server.auth] },
	async (request, reply) => {
		const subscription = request.body;
		const userId = request.user.id;
		
		// Évite d'ajouter les doublons si l'utilisateur s'abonne plusieurs fois
		const subscriptions = await server.prisma.pushSubscription.findMany({where : {endpoint : subscription.endpoint}})
		
		if (subscriptions.length === 0) {
			await server.prisma.pushSubscription.upsert({
				where : {endpoint: subscription.endpoint},
				update : {
					userId : userId,
					p256dh : subscription.keys.p256dh,
					auth : subscription.keys.auth
				},
				create: {
					userId: userId,
					endpoint: subscription.endpoint,
					p256dh: subscription.keys.p256dh,
					auth: subscription.keys.auth
				}
			})
			// subscriptions.push(subscription);
			// console.log("enregistrement", subscription)
		}

		return reply.code(201).send({ success: true, message: 'Abonné avec succès !' });
	});

	// 2. Fonction réutilisable pour envoyer un Push (décorée sur l'instance Fastify)
	server.decorate('sendNotif', async (payloadData) => {
		// console.log("SEND NOTIF", payloadData)
		const payload = JSON.stringify(payloadData);
		// console.log("SEND NOTIF", payload)
		const subscriptions = await server.prisma.pushSubscription.findMany();
		// console.log("subs", subs)
		const promises = subscriptions.map(async (subi) => {
            const pushconfig = {
                endpoint: subi.endpoint,
                keys: {
                    p256dh: subi.p256dh,
                    auth: subi.auth
                }
            };

            try {
                await server.webpush.sendNotification(pushconfig, payload);
            } catch (err) {
                if (err.statusCode === 410 || err.statusCode === 404) {
                    console.log(`Abonnement ${subi.id} expiré, suppression...`);
                    await server.prisma.pushSubscription.delete({
                        where: { id: subi.id }
                    });
                } else {
                    console.error('Erreur Push:', err);
                }
            }
        });

		await Promise.all(promises);
	});

	// 3. Route d'exposé HTTP (si vous voulez tester manuellement via Postman/cURL)
	server.post('/send-notification', async (request, reply) => {
		await server.sendNotif({
			title: 'Nouveau message !',
			body: 'Votre machine Miele a terminé son cycle 🧺',
			icon: '/favicon.png',
		});

		return { success: true, message: 'Notifications envoyées' };
	});
});

/*

await server.sendNotif({
      title: 'Lavage terminé 🧺',
      body: 'Le cycle QuickPowerWash est terminé !',
      icon: '/favicon.png',
    });

*/
