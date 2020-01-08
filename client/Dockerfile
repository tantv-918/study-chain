# build stage
FROM node:10-alpine as build-stage
WORKDIR /client
COPY . .
RUN yarn install
RUN yarn build

# production stage
FROM nginx:1.17-alpine as production-stage
COPY --from=build-stage /client/dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
