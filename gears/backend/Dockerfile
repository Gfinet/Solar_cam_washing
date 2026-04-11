FROM node:22-slim

RUN apt-get update -y && apt-get install -y openssl
COPY ./ /data
WORKDIR /data

EXPOSE 5000

COPY launch.sh /launch.sh
RUN chmod +x /launch.sh

ENTRYPOINT ["bash", "-c", "/launch.sh"]