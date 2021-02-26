FROM node:alpine

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install

COPY . .

ENV NODE_ENV=docker

EXPOSE 8628

CMD ["npm", "start"]