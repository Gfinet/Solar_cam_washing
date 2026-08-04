import auth from './auth.js'
import SMA from './Solar_Wash/SMA.js'
import mb from './Solar_Wash/modbus_solar.js'
import weather from './Solar_Wash/weather.js'
import miele from './Solar_Wash/mieleWashing.js'
import clim from './Clim/ClimHandler.js'
import webpush from './web-push.js'



export default async function (server, opts) {
  // On enregistre les routes d'authentification
  // Toutes les routes dans auth.js commenceront par /auth
  await server.register(auth)
  await server.register(SMA)
  await server.register(mb)
  await server.register(weather)
  await server.register(miele)
  await server.register(clim)
  await server.register(webpush) 

  // Toutes les routes dans tables.js commenceront par /tables
//   await server.register(table, { prefix: '/tables' })
}