# How-to guide

# docker build -t jack_ripper .
# docker run -d -p 4000:4000 -v /srv/Downloads/Ripper:/downloads jack_ripper
FROM fedora:33

WORKDIR /srv/
EXPOSE 4000
RUN dnf install nodejs
RUN dnf install java-latest-openjdk
RUN npm install -g ts-node

# Build 
COPY . /srv
RUN npm install

CMD ["npm", "run", "start"]