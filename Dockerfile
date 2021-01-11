# How-to guide

# docker build -t jack_ripper .
# docker run -d -p 4000:4000 -v /mnt/Downloads/Ripper:/srv/Downloads/ jack_ripper
FROM timbru31/java-node:8-jre-fermium

WORKDIR /srv/
EXPOSE 4000

# Build 
COPY . /srv
RUN npm install

CMD ["npm", "run", "start"]