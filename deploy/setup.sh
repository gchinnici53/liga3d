#!/bin/bash
# Primer deploy en el VPS — correr UNA SOLA VEZ
# Uso: bash deploy/setup.sh

set -e

APP_DIR="/var/www/liga3d"

echo "==> Creando directorio de la app..."
sudo mkdir -p "$APP_DIR"
sudo chown "$USER":"$USER" "$APP_DIR"

echo "==> Clonando repositorio..."
# Reemplazá con tu URL de git
git clone https://github.com/TU_USUARIO/liga3d.git "$APP_DIR"
cd "$APP_DIR"

echo "==> Instalando dependencias..."
npm install

echo "==> Configurando variables de entorno..."
cat > .env.local << 'EOF'
# COMPLETAR antes de correr
NEXTAUTH_URL=https://liga3d.appchinni.com
NEXTAUTH_SECRET=REEMPLAZAR_CON_SECRET_SEGURO
DATABASE_URL=file:./liga3d.db
EOF

echo ""
echo "⚠️  Editá el archivo .env.local con los valores correctos antes de continuar."
echo "   nano $APP_DIR/.env.local"
echo ""
read -p "Presioná Enter cuando hayas editado .env.local..."

echo "==> Ejecutando migraciones..."
npx prisma migrate deploy

echo "==> Creando usuario admin..."
npm run seed

echo "==> Build de producción..."
npm run build

echo "==> Iniciando con PM2..."
pm2 start ecosystem.config.js
pm2 save

echo ""
echo "==> Configurando Nginx..."
sudo cp deploy/nginx.conf /etc/nginx/sites-available/liga3d
sudo ln -sf /etc/nginx/sites-available/liga3d /etc/nginx/sites-enabled/liga3d
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "✅ Setup completo!"
echo "   App corriendo en http://liga3d.appchinni.com"
echo ""
echo "Para habilitar HTTPS:"
echo "   sudo certbot --nginx -d liga3d.appchinni.com"
