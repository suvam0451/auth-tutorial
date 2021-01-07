FROM node:latest

WORKDIR /srv/
COPY /opt/auth-server /srv/auth-server
RUN yarn install
EXPOSE 3000
CMD ["yarn", "start"]