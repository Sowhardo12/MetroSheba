#!/bin/bash

echo "🚀 Initializing MetroSheba Project (Latest Tech Stack)..."
mkdir -p apps/backend apps/frontend docker/db_init
echo "Setting up Backend (Express + PG)..."
cd apps/backend
npm init -y
npm install express pg dotenv cors helmet morgan jsonwebtoken bcrypt
npm install -D nodemon
mkdir -p src/controllers src/routes src/models src/middleware src/config src/utils src/services
touch src/index.js .env
cd ../..

echo "Setting up Frontend (Vite + React + Tailwind v4)..."
cd apps/frontend

npm create vite@latest . -- --template react --yes

npm install
npm install tailwindcss @tailwindcss/vite
npm install lucide-react leaflet react-leaflet axios react-router-dom

cat <<EOF > vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
EOF

echo '@import "tailwindcss";' > src/index.css
cd ../..

echo "Creating Docker and Database configs..."
touch docker-compose.yml
touch docker/db_init/init.sql
touch README.md .gitignore

echo "------------------------------------------------"
echo "Structure Ready"
echo "------------------------------------------------"