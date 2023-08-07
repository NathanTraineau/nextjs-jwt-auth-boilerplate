FROM node:18-slim AS dependencies

WORKDIR /app
RUN apt-get update && apt-get upgrade -y && apt-get -qy install openssl

COPY package.json yarn.lock /app/
RUN yarn install


FROM node:18-slim AS build

WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package.json ./package.json
COPY prisma ./prisma/
COPY . .

RUN npx prisma generate
RUN yarn build

FROM node:18-slim AS deploy

WORKDIR /app

ENV NODE_ENV production

COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]

# Utilisation du répertoire /app pour stocker les fichiers de l'application
VOLUME /app