#FROM node:16-alpine3.15
FROM node@sha256:bb776153f81d6e931211e3cadd7eef92c811e7086993b685d1f40242d486b9bb
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY ./ ./
ENTRYPOINT ["yarn", "start"]
