import auth from './auth.js'
import SMA from './SMA.js'
import mb from './modbus_solar.js'



export default async function (server, opts) {
  // On enregistre les routes d'authentification
  // Toutes les routes dans auth.js commenceront par /auth
  await server.register(auth)
  await server.register(SMA)
  await server.register(mb)

  // Toutes les routes dans tables.js commenceront par /tables
//   await server.register(table, { prefix: '/tables' })
}