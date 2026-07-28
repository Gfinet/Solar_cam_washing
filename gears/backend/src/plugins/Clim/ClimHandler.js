import fp from 'fastify-plugin'
import { createAppliance } from 'node-mideahvac'


export default fp ( async (server) =>{
	async function connectClim() {

		const appliance = createAppliance({
			communicationMethod: 0,
			ip: process.env.CLIM_IP,
			id: Number(process.env.CLIM_ID),
			account:  process.env.CLIM_ACCOUNT,
      		password: process.env.CLIM_PSWD,
			appkey:   '3742e9e5842d4ad59c2db887e12449f9',
      		appid:    1017,
		});

		const status = await appliance.getStatus();
		console.log('Clim status:', status);
		server.decorate('clim', appliance);

		// const discovery = new mideaHvac.Discovery()

		// const devices = await discovery.start({
		// 	account: process.env.CLIM_ACCOUNT,
		// 	password: process.env.CLIM_PSWD,
		// 	appname: process.env.CLIM_APP // Précise bien l'application
		// });
		console.log('Appareils trouvés :', appliance)
	}
	connectClim().catch(err => console.error('Clim connexion échouée:', err.message));
})