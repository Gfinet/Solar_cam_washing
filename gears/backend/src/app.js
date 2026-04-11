import Fastify from 'fastify'
import pkg from '@prisma/client';

import serverOn from './server.js'



// Connexion à la DB au démarrage du serveur
const start = async () => {
    let server;
    try 
    {
        server = await serverOn();
        console.log("serv listening on localhost:3000")
        let stopping = false
		async function exitWhenStopped() 
        {
			if (!stopping) 
            {
				stopping = true
				server.log.info('Stopping Transcendence platform')
				await server.close()
				server.log.info('Transcendence platform stopped')
				// eslint-disable-next-line n/no-process-exit
				process.exit(0)
			}
		}

		process.on('SIGINT', exitWhenStopped)
		process.on('SIGTERM', exitWhenStopped)
		process.on('SIGHUP', exitWhenStopped)
		process.on('SIGUSR2', exitWhenStopped) // for nodemon restart
		process.on('SIGBREAK', exitWhenStopped)
		process.on('message', function (m) { if (m === 'shutdown') exitWhenStopped()})
        
        await server.listen({ port: 3000, host: '0.0.0.0' })
    } 
    catch (err) 
    {
        console.log(err)
        process.exit(1)
    }
}

start()