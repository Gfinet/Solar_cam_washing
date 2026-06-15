# Solar_Cam 🌞📷

Projet personnel de domotique visant à centraliser et visualiser des données issues de panneaux solaires (SMA), de machines à laver connectées (Miele), de caméras de surveillance et d'une sonnette connectée (EZVIZ), accessibles depuis une interface web sécurisée.

---

## Fonctionnalités

- **Production solaire** : collecte horaire des données de production via l'API SMA (puissance instantanée, tension, production totale) et stockage en base de données
- **Météo** : récupération automatique des prévisions météo (température, rayonnement solaire) via [Open-Meteo](https://open-meteo.com/) avec mise à jour quotidienne
- **Caméras EZVIZ** : authentification via l'API EZVIZ et flux vidéo en temps réel via go2rtc
- **Machine à laver Miele** : intégration prévue (Miele API)
- **Authentification JWT** : connexion sécurisée avec token JWT (expiration 7 jours), mots de passe hashés avec bcrypt
- **Notifications push** : infrastructure web-push en place (en cours de développement)

---

## Stack technique

| Couche      | Technologie                              |
|-------------|------------------------------------------|
| Frontend    | React + React Router                     |
| Backend     | Node.js + Fastify                        |
| ORM         | Prisma v5                                |
| Base de données | PostgreSQL                           |
| Reverse proxy | Nginx                                  |
| VPN / accès distant | Tailscale                        |
| Flux vidéo  | go2rtc                                   |
| Conteneurisation | Docker + Docker Compose             |

---

## Architecture

```
                    ┌─────────────┐
                    │  Tailscale  │  (VPN – accès distant sécurisé)
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │    Nginx    │  (reverse proxy)
                    └──────┬──────┘
               ┌───────────┼───────────┐
        ┌──────▼──────┐        ┌───────▼──────┐
        │   Frontend  │        │   go2rtc     │  (flux RTSP/WebRTC)
        │  (React)    │        └──────────────┘
        └──────┬──────┘
        ┌──────▼──────┐
        │   Backend   │  (Fastify – port 3000)
        │  (Node.js)  │
        └──────┬──────┘
        ┌──────▼──────┐
        │ PostgreSQL  │  (port 5432)
        └─────────────┘
```

---

## Prérequis

- [Docker](https://www.docker.com/) et Docker Compose
- [Make](https://www.gnu.org/software/make/)
- (Optionnel) Node.js 20+ pour le développement local

---

## Installation et lancement

### Avec Docker (recommandé)

```bash
# Cloner le dépôt
git clone <url-du-repo>
cd MyTranscendance

# Lancer en mode développement
make dev

# Lancer en mode production
make
```

### Variables d'environnement

Créer un fichier `.env` dans `gears/backend/` (un `.env.example` est disponible) :

```env
EZVIZ_KEY=<votre_clé_api_ezviz>
EZVIZ_SECRET=<votre_secret_ezviz>
SMA_ID=<identifiant_onduleur_sma>
APP_MODE=dev
```

Créer un fichier `.env` dans `gears/tailscale/` :

```env
TS_AUTHKEY=<votre_clé_auth_tailscale>
```

---

## Commandes Makefile

| Commande     | Description                                      |
|--------------|--------------------------------------------------|
| `make`       | Build et démarrage complet (mode prod)           |
| `make dev`   | Build et démarrage en mode développement         |
| `make clean` | Arrêt des conteneurs et suppression des images   |
| `make re`    | Rebuild complet (clean + relance)                |
| `make stop`  | Arrêt des conteneurs                             |

---

## Commandes utiles

```bash
# Inspecter la base de données avec Prisma Studio
npx prisma studio --url="postgresql://user_admin:mon_password_secret@localhost:5432/db"

# Tester un flux RTSP avec ffmpeg (caméra de test)
ffmpeg -re -f lavfi -i testsrc=size=1280x720:rate=30 \
  -c:v libx264 -preset ultrafast -tune zerolatency \
  -pix_fmt yuv420p -an -g 30 -f rtsp rtsp://localhost:8554/camera_test

# Relancer uniquement le backend (sans rebuild)
docker-compose restart backend
```

---

## Structure du projet

```
MyTranscendance/
├── gears/
│   ├── backend/        # API Fastify (Node.js)
│   │   ├── src/
│   │   │   ├── plugins/    # Intégrations : SMA, EZVIZ, Miele, météo, JWT
│   │   │   └── routes/     # Endpoints REST
│   │   └── prisma/         # Schéma de base de données
│   ├── frontend/       # Interface React
│   ├── db/             # Dockerfile PostgreSQL
│   ├── nginx/          # Configuration reverse proxy
│   ├── tailscale/      # Configuration VPN
│   └── go2rtc/         # Configuration flux vidéo
├── TCP_serv/           # Serveur TCP (simulateur)
├── ffmpeg_serv/        # Outils ffmpeg / MediaMTX
├── docker-compose.yml
└── Makefile
```

---

## Auteur

**Gfinet** – projet personnel de domotique maison
