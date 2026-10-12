# Étape 1 : validation des données, tests et compilation.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Variables Railway lues à la compilation pour l'affichage des versions : canal (« preprod » sur develop) et commit.
ARG CANAL
ARG RAILWAY_GIT_COMMIT_SHA
RUN npm run build

# Étape 2 : serveur Caddy, fichiers statiques uniquement.
FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
EXPOSE 8080
