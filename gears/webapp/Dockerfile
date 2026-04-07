FROM node:20-slim

RUN apt install -y python3

COPY ./backend/ /usr/local/src
WORKDIR /usr/local/src

EXPOSE 5000

COPY launch.sh /launch.sh
RUN chmod +x /launch.sh

ENTRYPOINT ["bash", "-c", "/launch.sh"]