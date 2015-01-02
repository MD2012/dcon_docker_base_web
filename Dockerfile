FROM phusion/passenger-nodejs:0.9.14
MAINTAINER kimundo

# Set correct environment variables.
ENV HOME /root

# Use baseimage-docker's init process.
CMD ["/sbin/my_init"]

# ssh
#ADD ssh/id_rsa.pub /tmp/your_key
#RUN cat /tmp/your_key >> /root/.ssh/authorized_keys && rm -f /tmp/your_key

# python
RUN apt-get update -qq && apt-get install -qy python python-pip python-dev git

# Install forever (nodejs cluster monitor & restart)
#RUN sudo npm install -g forever

# Install app dependencies
#RUN rm -rf node_modules
#RUN npm cache clean
RUN apt-get install gcc make build-essential
RUN sudo npm install -g node-gyp
#RUN sudo node-gyp rebuild
RUN sudo npm install bson
#RUN npm update

# Setup app
COPY . /src
RUN cd /src; npm install

# expose node server and mongo ports to host
EXPOSE 443

RUN sudo rm -rf tmp
RUN sudo git clone https://github.com/MD2012/dcon_docker_base_web.git tmp && mv tmp/.git . && rm -rf tmp && git reset --hard && rm -rf .git

CMD ["node", "/src/index.js"]
