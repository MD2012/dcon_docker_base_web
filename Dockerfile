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
RUN apt-get update -qq && apt-get install -qy python python-pip python-dev git
RUN sudo pip install fig
RUN fig --version

# Install forever (nodejs cluster monitor & restart)
RUN sudo npm install -g forever

# Setup app
COPY . /src

# Install app dependencies
RUN cd /src; npm install

# expose node server and mongo ports to host
EXPOSE 443

RUN sudo rm -rf tmp
RUN sudo git clone https://github.com/MD2012/dcon_docker_base_web.git tmp && mv tmp/.git . && rm -rf tmp && git reset --hard && rm -rf .git

CMD ["node", "/src/index.js"]

#RUN pwd
#COPY fig.yml /fig.yml
#RUN fig up
