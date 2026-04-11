import auth from './auth.js'



export default async function (server, opts) {
  // On enregistre les routes d'authentification
  // Toutes les routes dans auth.js commenceront par /auth
  await server.register(auth)

  // Toutes les routes dans tables.js commenceront par /tables
//   await server.register(table, { prefix: '/tables' })
}