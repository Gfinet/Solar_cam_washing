-- Création de la table utilisateur
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertion d'un utilisateur de test (password: 'password123' - en réel on hash !)
INSERT INTO users (username, password_hash) 
VALUES ('admin', 'password123');