# FROM base:bullseye
FROM node:lts-bullseye-slim

# RUN apt install -y nodejs
# RUN apt install -y npm

COPY ./src/ /usr/local/src
WORKDIR /usr/local/src

RUN npm install
RUN npm install express --save
# RUN npm install --save-dev nodemon

ENTRYPOINT ["bash", "-c", "npm run start"]