FROM node:14

WORKDIR /opt/autocast

COPY package.json tsconfig.json package-lock.json nodecastor.d.ts autocast.ts run.sh ./
RUN apt-get update && apt-get -y install dbus libavahi-compat-libdnssd-dev avahi-daemon avahi-discover libnss-mdns

RUN npm install
RUN chmod +x run.sh

ENTRYPOINT ["/opt/autocast/run.sh"]

