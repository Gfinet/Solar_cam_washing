# FROM base:bullseye
FROM node:lts-bullseye

# RUN apt install -y nodejs
# RUN apt install -y npm

RUN apt install -y python3

# COPY ./src/package.json /usr/local/src/package.json
WORKDIR /usr/local/src
# RUN pwd

# RUN npm install
RUN npm install express --save
RUN npm install --save-dev nodemon

ENTRYPOINT ["bash", "-c", "npm run dev"]