FROM phusion/passenger-nodejs:0.9.14
MAINTAINER dcon

# Set correct environment variables.
ENV HOME /root

# Use baseimage-docker's init process.
CMD ["/sbin/my_init"]

# ssh
ADD ssh/id_rsa.pub /tmp/your_key
RUN cat /tmp/your_key >> /root/.ssh/authorized_keys && rm -f /tmp/your_key

# install meteor
RUN curl https://install.meteor.com | /bin/sh

# Remove the default site
RUN rm /etc/nginx/sites-enabled/default

# Enable nginx
RUN rm -f /etc/service/nginx/down

# Setup app
ADD webapp.conf /etc/nginx/sites-enabled/webapp.conf
RUN mkdir /home/app/simple-wishes
ADD simple-wishes /home/app/simple-wishes
