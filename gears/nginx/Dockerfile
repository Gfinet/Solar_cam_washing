FROM debian:bullseye-slim

RUN apt update -y
RUN apt upgrade -y

RUN apt install -y nginx
RUN apt install openssl -y
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /etc/nginx/ssl
COPY crt/tailscale.crt /etc/nginx/ssl/nginx.crt
COPY crt/tailscale.key /etc/nginx/ssl/nginx.key


RUN mkdir -p /var/run/nginx
COPY nginx.conf /etc/nginx/nginx.conf

RUN chmod 755 /var/www/html
RUN chown -R www-data:www-data /var/www/html

CMD ["nginx", "-g", "daemon off;"]