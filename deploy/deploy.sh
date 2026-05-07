#!/bin/bash
# Deploy de actualizaciones — correr en cada nuevo deploy
# Uso: bash deploy/deploy.sh

set -e

APP_DIR="/var/www/liga3d"
cd "$APP_DIR"

echo "==> Pulling cambios..."
git pull origin main

echo "==> Instalando dependencias nuevas (si las hay)..."
npm install

echo "==> Aplicando migraciones de DB..."
npx prisma migrate deploy

echo "==> Build de producción..."
npm run build

echo "==> Reiniciando app..."
pm2 restart liga3d

echo ""
echo "✅ Deploy completado!"
pm2 status liga3d
