FROM node:18-alpine AS builder


WORKDIR /usr/src/app


COPY package*.json ./


RUN npm install

COPY . .


RUN npm run build


FROM node:18-alpine AS production


WORKDIR /usr/src/app


COPY package*.json ./


RUN npm install --only=production

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 10101

ENV PORT=10101
ENV NODE_ENV=production

CMD [ "npm", "start" ]