# FROM base:bullseye
FROM node:24-slim

# RUN apt install -y nodejs
# RUN apt install -y npm

# RUN apt install -y python3

# COPY ./src/package.json /usr/local/src/package.json
WORKDIR /usr/local/src
COPY ./webapp.sh /usr/local/webapp.sh
RUN chmod +x /usr/local/webapp.sh
# RUN pwd

# RUN npm i fastify
# RUN npm i npm-run-all -D
# RUN npm i
# RUN npm install express --save
# RUN npm install --save-dev nodemon

ENTRYPOINT ["bash", "-c", "/usr/local/webapp.sh"]