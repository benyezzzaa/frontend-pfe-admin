# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install app dependencies
RUN npm install

RUN npm install axios
# Copy the rest of the application source code
COPY . .

# The command that will be run when the container starts
# 'start:dev' is the standard command in NestJS for running with hot-reloading
CMD ["npm", "run", "start:dev"]