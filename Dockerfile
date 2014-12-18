FROM phusion/passenger-nodejs:0.9.14
MAINTAINER dcon

# Set correct environment variables.
ENV HOME /root

# Use baseimage-docker's init process.
CMD ["/sbin/my_init"]

# ssh
#ADD ssh/id_rsa.pub /tmp/your_key
#RUN cat /tmp/your_key >> /root/.ssh/authorized_keys && rm -f /tmp/your_key

# Install Pip and Fig
RUN curl -L https://github.com/docker/fig/releases/download/1.0.1/fig-`uname -s`-`uname -m` > /usr/local/bin/fig; chmod +x /usr/local/bin/fig
RUN sudo apt-get install -y pip
RUN sudo pip install -U fig

# Installation:
# Import MongoDB public GPG key AND create a MongoDB list file
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
RUN echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | tee /etc/apt/sources.list.d/10gen.list

# Update apt-get sources AND install MongoDB
RUN apt-get update && apt-get install -y mongodb-org

# Create the MongoDB data directory
RUN mkdir -p /data/db

# Set usr/bin/mongod as the dockerized entry-point application
# ENTRYPOINT usr/bin/mongod

# install meteor
#RUN curl https://install.meteor.com | /bin/sh

# Remove the default site
#RUN rm /etc/nginx/sites-enabled/default

# Enable nginx
#RUN rm -f /etc/service/nginx/down


# Setup app
COPY . /src

# Install app dependencies
RUN cd /src; npm install

# expose node server and mongo ports to host
EXPOSE  8080 27017

CMD ["node", "/src/index.js"]
