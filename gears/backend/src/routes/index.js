import auth from './auth.js'
import SMA from './SMA.js'



export default async function (server, opts) {
  // On enregistre les routes d'authentification
  // Toutes les routes dans auth.js commenceront par /auth
  await server.register(auth)
  await server.register(SMA)

  // Toutes les routes dans tables.js commenceront par /tables
//   await server.register(table, { prefix: '/tables' })
}