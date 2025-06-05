# Dockerfile
FROM node:18-alpine

# 1. Create /app folder inside container
WORKDIR /app

# 2. Copy package.json & package-lock.json
COPY package*.json ./

# 3. Install dependencies
RUN npm install --include=dev

# 4. Copy the rest of your source code
COPY . .

# 5. Build Tailwind (if you have a script "build:css" in package.json)
RUN npm run build:css

# 6. Expose the port your app listens on
EXPOSE 8080

# 7. Launch the app
CMD ["npm", "start"]
