FROM node:20-slim

COPY ./ /data
WORKDIR /data

EXPOSE 5000

COPY launch.sh /launch.sh
RUN chmod +x /launch.sh

ENTRYPOINT ["bash", "-c", "/launch.sh"]