FROM base:bullseye

# FROM debian:bullseye-slim

# RUN apt update -y
# RUN apt upgrade -y

RUN apt install -y nginx
RUN apt install openssl -y
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /etc/nginx/ssl
RUN openssl req -x509 -nodes -out /etc/nginx/ssl/nginx.crt -keyout /etc/nginx/ssl/nginx.key -subj "/C=FR/ST=IDF/L=Paris/0=42/OU=42/CN=gfinet.42.fr/UID=gfinet"

RUN mkdir -p /var/run/nginx
COPY nginx.conf /etc/nginx/nginx.conf

RUN chmod 755 /var/www/html
RUN chown -R www-data:www-data /var/www/html

CMD ["nginx", "-g", "daemon off;"]