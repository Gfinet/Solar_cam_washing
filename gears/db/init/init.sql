CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

-- On insère LE seul et unique compte autorisé
-- Remplace 'parents' et 'chocolat' par ce que tu veux
INSERT INTO users (username, password_hash) 
VALUES ('parents', 'chocolat')
ON CONFLICT DO NOTHING;