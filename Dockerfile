FROM node:18-alpine AS builder


WORKDIR /usr/src/app


COPY package*.json ./


RUN npm install
RUN npm install express-session

COPY . .


RUN npm run build


FROM node:18-alpine AS production


WORKDIR /usr/src/app


COPY package*.json ./


RUN npm install && npm install express-session --only=production

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 10101

ENV PORT=10101
ENV NODE_ENV=production

CMD [ "npm", "start" ]