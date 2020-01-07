FROM node:10

WORKDIR /app

COPY . .

# RUN npm install

# Development
# CMD ["npm", "start"]

# Production
RUN npm install -g pm2
CMD ["pm2-runtime", "./bin/www"]
