#!/bin/sh

set -e

echo "Executando migrations/push do Drizzle..."
npx drizzle-kit push

echo "Executando seed do banco..."
npm run db:seed

echo "Iniciando backend NestJS..."
npm run start:dev