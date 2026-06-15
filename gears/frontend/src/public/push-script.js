


self.addEventListener('push', function(event) {
    
    // 2. On récupère les données textuelles envoyées par ton backend Fastify
    // (par exemple le titre et le message de la caméra)
    const payload = event.data ? event.data.json() : { title: "Alerte", body: "Mouvement détecté" };

    // 3. On demande au téléphone d'afficher la notification officielle
    event.waitUntil(
        self.registration.showNotification(payload.title, {
            body: payload.body,
            icon: '/favicon.png',
            badge: '/badge.png'
        })
    );
});