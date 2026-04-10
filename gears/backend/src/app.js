import Fastify from 'fastify'
import pg from 'pg'


const { Client } = pg

const fastify = Fastify({
  logger: true
})

// Declare a route
fastify.get('/api', function (request, reply) {
  reply.send({ hello: 'world' })
})

const client = new Client({
    connectionString :'postgresql://user_admin:mon_password_secret@db:5432/postgres'
})



// Connexion à la DB au démarrage du serveur
const start = async () => {
  try {
    await client.connect()
    fastify.log.info('Connecté à la base de données PostgreSQL')
    
    await client.query(`
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
    );
    
    INSERT INTO users (username, password_hash) 
    VALUES ('parents', 'chocolat') 
    ON CONFLICT DO NOTHING;
    `);

    await fastify.listen({ port: 3000, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

fastify.post('/api/login', async (request, reply) => {
 const { username, password } = request.body; 

  try {
    const res = await client.query(
      'SELECT username FROM users WHERE username = $1 AND password_hash = $2',
      [username, password]
    );

    if (res.rows.length > 0) {
      return { 
        success: true, 
        message: `Bienvenue ${res.rows[0].username} !` 
      };
    } else {
      reply.code(401);
      return { success: false, message: "Accès refusé : Identifiants incorrects" };
    }
  } catch (err) {
    fastify.log.error(err);
    reply.code(500);
    return { error: "Erreur technique" };
  }
})

// Une route pour tester si la DB répond
fastify.get('/api/db-test', async (request, reply) => {
  const res = await client.query('SELECT NOW()') // Demande l'heure à la DB
  return { now: res.rows[0] }
})

start()