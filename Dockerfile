FROM node:16-alpine3.15 as builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY tslint.json ./
COPY src ./src
RUN apk update && apk upgrade && apk add npm && apk add curl && npm ci && npm run build

FROM node:16-alpine3.15
WORKDIR /app
COPY -from=builder /app/package*.json
COPY --from=builder /app/www/ /app/www/ 

# Bundle app source
# EXPOSE 8080
CMD [ "npm", "run", "prod" ]