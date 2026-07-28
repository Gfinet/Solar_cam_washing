import auth from './auth.js'
import SMA from './Solar_Wash/SMA.js'
import mb from './Solar_Wash/modbus_solar.js'
import weather from './Solar_Wash/weather.js'
import miele from './Solar_Wash/mieleWashing.js'
import clim from './Clim/ClimHandler.js' // TODO: trouver l'ID Midea



export default async function (server, opts) {
  // On enregistre les routes d'authentification
  // Toutes les routes dans auth.js commenceront par /auth
  await server.register(auth)
  await server.register(SMA)
  await server.register(mb)
  await server.register(weather)
  await server.register(miele)
  await server.register(clim) // TODO: trouver l'ID Midea

  // Toutes les routes dans tables.js commenceront par /tables
//   await server.register(table, { prefix: '/tables' })
}