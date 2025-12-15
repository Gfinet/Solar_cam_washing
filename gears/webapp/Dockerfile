FROM base:bullseye

# FROM debian:bullseye-slim

# RUN apt update -y
# RUN apt upgrade -y

RUN apt install -y nodejs
RUN apt install -y npm
# RUN npm install
# RUN apt install -y
# RUN apt install -y

COPY ./src/ /usr/local/src
WORKDIR /usr/local/src

RUN npm install express --save
# RUN npm install --save-dev nodemon

ENTRYPOINT ["bash", "-c", "npm run start"]