# Set the base image to Ubuntu
FROM    ubuntu

# File Author / Maintainer
MAINTAINER Anand Mani Sankar

# Install Node.js and other dependencies
RUN apt-get update && \
    apt-get -y install curl git && \
    curl -sL https://deb.nodesource.com/setup_0.12 | sudo -E bash - \
    apt-get -y install python build-essential nodejs libkrb5-dev

# Install pm2
RUN npm install -g pm2

# Provides cached layer for node_modules
ADD package.json /tmp/package.json
RUN cd /tmp && npm install --production
RUN mkdir -p /src && cp -a /tmp/node_modules /src/

# Define working directory
WORKDIR /src
ADD . /src

# set environment to production
ENV NODE_ENV production

# Expose port
EXPOSE  8080

# Run app using pm2
CMD ["pm2", "start", "/src/server/app.js", "--no-daemon"]
