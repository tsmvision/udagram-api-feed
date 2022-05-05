FROM node:16-alpine3.15

WORKDIR /app

COPY package*.json .
COPY tsconfig.json .
COPY tslint.json .
COPY src ./src
RUN apk update && apk upgrade && apk add npm && apk add curl && npm ci 

# Bundle app source
# EXPOSE 8080
CMD [ "npm", "run", "prod" ]