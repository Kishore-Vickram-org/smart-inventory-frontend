# React dev server (Create React App)
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV HOST=0.0.0.0 \
	PORT=3000 \
	BROWSER=none \
	CHOKIDAR_USEPOLLING=true \
	WATCHPACK_POLLING=true

EXPOSE 3000

CMD ["npm", "start"]
