# FROM base:bullseye
FROM node:lts-bullseye

# RUN apt install -y nodejs
# RUN apt install -y npm

RUN apt install -y python3

COPY ./src/ /usr/local/src
WORKDIR /usr/local/src

RUN npm install
RUN npm install express --save
# RUN npm install --save-dev nodemon

ENTRYPOINT ["bash", "-c", "npm run start"]