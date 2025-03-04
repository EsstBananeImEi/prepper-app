# Stage 1: React-App bauen mit Node.js v20.18.3 auf Bullseye (mehr Ressourcen)
FROM node:20.18.3-bullseye as build
WORKDIR /app

# Kopiere package.json und yarn.lock (falls vorhanden)
COPY package.json yarn.lock ./

# Installiere Abhängigkeiten mit Yarn und erhöhe den Netzwerk-Timeout
RUN yarn install --frozen-lockfile --network-timeout 600000

# Kopiere den restlichen Quellcode
COPY . .

# Baue die React-App
RUN yarn build

# Stage 2: Statische Dateien mit Nginx servieren
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
