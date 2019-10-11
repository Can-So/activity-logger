FROM node:10.13

RUN npm install -g yarn

# Copy required source code
COPY ./src /usr/activity-logging-service/src/
COPY ./scripts /usr/activity-logging-service/scripts/
COPY ./truffle/ /usr/activity-logging-service/truffle/
COPY ./package.json /usr/activity-logging-service/package.json
WORKDIR /usr/activity-logging-service/

# Install dependencies
RUN yarn

CMD ["yarn", "start-container"]