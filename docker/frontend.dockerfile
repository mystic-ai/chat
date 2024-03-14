# pull official base image
FROM node:20-alpine3.17

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY src/frontend/mystic-chat/package.json ./
COPY src/frontend/mystic-chat/package-lock.json ./

RUN npm install
RUN npm install react-scripts@3.4.1 -g

# add app
COPY ./src/frontend/mystic-chat/src ./src
COPY ./src/frontend/mystic-chat/pages ./pages
COPY ./src/frontend/mystic-chat/public ./public

ARG NEXT_PUBLIC_BACKEND_URL="http://mystic-chat-backend"

ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
RUN if [ "$FULL_BUILD" = "true" ] ; then npm run build; fi

CMD ["npm", "run", "dev"]
