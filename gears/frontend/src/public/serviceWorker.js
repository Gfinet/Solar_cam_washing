


self.addEventListener('push', function(event) {
    
    // 2. On récupère les données textuelles envoyées par ton backend Fastify
    // (par exemple le titre et le message de la caméra)
    const payload = event.data ? event.data.json() : {};

    const options = {
        body: payload.body || 'Nouvelle notification !',
        icon: payload.icon || '/favicon.png',
        vibrate: [100, 50, 100],
        data: {
        url: '/' // URL à ouvrir lors du clic
        }
    };

    // 3. On demande au téléphone d'afficher la notification officielle
    event.waitUntil(
        self.registration.showNotification(payload.title || 'Notification', options)
    );
    self.addEventListener('notificationclick', event => {
        event.notification.close();
        event.waitUntil(clients.openWindow(event.notification.data.url));
    });
});