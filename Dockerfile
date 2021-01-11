# How-to guide

# docker build -t jack_ripper .
# $ docker run -d -p 4000:4000 -v /srv/Downloads/Ripper:/downloads jack_ripper
FROM node:latest

WORKDIR /srv/
COPY ./auth-server /srv/auth-server
RUN npm install
EXPOSE 4000
CMD ["npm", "run", "start"]