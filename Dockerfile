FROM debian:buster-slim

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update

RUN apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_6.x | bash - && \
    apt-get install -y nodejs

RUN apt-get install -y nginx

WORKDIR /var/www/html
COPY . .

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
