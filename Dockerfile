FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install all dependencies including dev dependencies
RUN npm install --include=dev

# Bundle app source
COPY . .

# Build Tailwind CSS (using npm script instead of direct npx command)
RUN npm run build:css

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]