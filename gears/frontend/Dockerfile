FROM node:20-slim

WORKDIR /data

COPY src/package*.json ./package.json
RUN npm install

COPY ./src .

COPY launch.sh /launch.sh
RUN chmod +x /launch.sh

EXPOSE 5173

ENTRYPOINT ["bash", "-c", "/launch.sh"]