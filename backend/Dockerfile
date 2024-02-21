
FROM node:latest

WORKDIR /app

# Копируем файлы package.json и package-lock.json (если есть)
COPY package*.json ./

# Устанавливаем зависимости, включая ts-node и nodemon
RUN npm install

# Копируем исходный код приложения в контейнер
COPY . .

# Открываем порт, который будет использоваться сервером
EXPOSE 3006

# Запускаем приложение с помощью ts-node через nodemon для разработки
CMD ["npx", "nodemon", "-L", "--watch", "src", "--ext", "ts", "--exec", "ts-node", "src/index.ts"]