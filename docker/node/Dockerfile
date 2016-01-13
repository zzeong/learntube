FROM nodesource/trusty:4.2.3

# Update npm
RUN npm install -g npm@3.5.3

# Install pm2
RUN npm install -g pm2@1.0.0

# Set the env variable DEBIAN_FRONTEND to noninteractive
ENV DEBIAN_FRONTEND noninteractive

# Install Dependency for https://github.com/christkv/kerberos
RUN apt-get update && \
    apt-get -y install libkrb5-dev

# Provides cached layer for node_modules
ADD package.json /tmp/package.json
RUN cd /tmp && npm install --production
RUN mkdir -p /src && cp -a /tmp/node_modules /src/

# Define working directory
WORKDIR /src
ADD . /src

# set environment to production
ENV NODE_ENV production

# Run app using pm2
CMD ["pm2", "start", "/src/server/app.js", "--no-daemon"]

# Expose port
EXPOSE  8080

