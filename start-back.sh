#!/bin/bash

docker compose up --build -d

# Start the backend
cd backend

npm run db:push
npm run db:seed
npm run start:dev

npm run start
