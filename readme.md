# Projet Club Poissons

## Lancement du projet en local

### Mode développement
Pour lancer le projet en local, commencez par cloner le projet. Si c'est la première fois que vous lancez le projet, installez les dépendances avec ces commandes :
```bash
cd frontend
bun install
cd ../backend
bun install
```

Puis pour lancer le projet, utilisez la commande suivante dans les deux dossiers `/frontend` et `/backend`.

```bash
bun run dev
```

### Via Docker

Avant de lancer le projet via Docker, vous devez créer un fichier `.env` contenant les variables d'environnement nécessaires à PostgreSQL et au back-end. Pour cela, vous pouvez dupliquer le fichier `.env.example` et y modifier les variables pré-enregistrées.  
Vous pouvez désormais lancer le projet localement sur Docker à l'aide de la commande 
```bash
docker compose up
```

## Architecture du pipeline CI/CD

### CI
À chaque **push** sur `main` ou chaque **pull request**, la pipeline CI va se lancer. Elle va récupérer le projet, installer les dépendances, exécuter le **linter**, le **formatter** puis lancer les tests.
### CD
Lors des **push** sur les branches `main` ou `staging`, la pipeline CD va s'exécuter. 
- On va d'abord s'identifier sur Docker avec les identifiants fournis dans les secrets GitHub.
- On va ensuite récupérer le projet, le build avec Docker et le push sur un registry GHCR.
- Puis, on va créer le `.env` du front-end.
- Si jamais le projet tourne déjà sur la machine distante, on va l'arrêter via un `compose down`.
- On va ensuite copier les fichiers de configuration (Grafana, Prometheus, Docker) sur le serveur.
- Enfin, on va effectuer un pull de l'image Docker sur le serveur et lancer le tout via un `compose up`.

## Choix techniques et justifications
Le seul choix technique a été de choisir Traefik, car il est plus facilement réglable depuis un conteneur Docker.


## Bonus implémentés
- **Optimisation du cache** Docker
- **Reverse proxy** via Traefik
- **Certificat SSL / HTTPS** via Traefik
- **Healthchecks** Docker
- **Monitoring** via Grafana et Prometheus
- **Pre-commit hooks** via Husky
- **Environnement de staging**
- **Dependabot**

## Site déployé

Le site déployé est disponible à l'adresse [https://club-poisson.duckdns.org](https://club-poisson.duckdns.org/), et la version de staging est disponible à l'adresse [https://club-poisson-staging.duckdns.org/](https://club-poisson-staging.duckdns.org/)

## Membres du groupe
- Alexis CHAPUSOT
- Emanuel FERNANDES DOS SANTOS
- Médéric CUNY
- Yoan NOUGUÉ-RUIZ