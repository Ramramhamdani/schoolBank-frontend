## Example Dockerfile for a React frontend
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source files
COPY . .


EXPOSE 3000
CMD ["npm", "run", "start"]


# ----------- Build Stage -----------
#FROM node:18 as build
#
#WORKDIR /app
#COPY package*.json ./
#RUN npm install --legacy-peer-deps
#COPY . .
#RUN npm run build
#
## ----------- Run Stage ------------
#FROM node:18
#
#WORKDIR /app
#COPY --from=build /app ./
#
#EXPOSE 3000
#ENV PORT 3000
#
#CMD ["npm", "start"]
