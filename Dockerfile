FROM phusion/passenger-nodejs:0.9.14
MAINTAINER dcon

# Set correct environment variables.
ENV HOME /root

# Use baseimage-docker's init process.
CMD ["/sbin/my_init"]

# Enable EPEL for Node.js
# RUN     rpm -Uvh http://download.fedoraproject.org/pub/epel/6/i386/epel-release-6-8.noarch.rpm
# Install Node.js and npm
# RUN     yum install -y npm

# ssh
#ADD ssh/id_rsa.pub /tmp/your_key
#RUN cat /tmp/your_key >> /root/.ssh/authorized_keys && rm -f /tmp/your_key

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

EXPOSE  8080

CMD ["node", "/src/index.js"]
