FROM node:8-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .
RUN npm install && \
    npm run build && \
    cp -f public/* dist
EXPOSE 3000
CMD [ "node", "run.js" ]

