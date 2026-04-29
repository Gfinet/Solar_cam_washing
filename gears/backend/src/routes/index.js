import auth from './auth.js'
import SMA from './SMA.js'
import mb from './modbus_solar.js'
import weather from './weather.js'
import miele from './mieleWashing.js'



export default async function (server, opts) {
  // On enregistre les routes d'authentification
  // Toutes les routes dans auth.js commenceront par /auth
  await server.register(auth)
  await server.register(SMA)
  await server.register(mb)
  await server.register(weather)
  await server.register(miele)

  // Toutes les routes dans tables.js commenceront par /tables
//   await server.register(table, { prefix: '/tables' })
}