FROM node:12

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 8628

CMD ["npm", "start"]