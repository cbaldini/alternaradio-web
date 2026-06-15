#!/bin/bash
# ============================================================
# setup-server.sh - Configuración del backend de Alterna Radio
# Ejecutar en el servidor via SSH con:
#   bash setup-server.sh
# ============================================================

set -e

echo "==> Instalando Node.js 22 (LTS)..."
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "==> Versión de Node: $(node --version)"
echo "==> Versión de npm:  $(npm --version)"

echo "==> Instalando PM2 globalmente..."
sudo npm install -g pm2

echo "==> Instalando dependencias del proyecto..."
npm install --omit=dev

echo "==> Iniciando servidor con PM2..."
pm2 start server.js --name alternaradio

echo "==> Guardando configuración de PM2..."
pm2 save

echo "==> Configurando PM2 para arrancar al reiniciar el servidor..."
pm2 startup systemd -u "$USER" --hp "$HOME" | tail -1 | bash || true

echo ""
echo "============================================================"
echo "  Listo! El servidor corre en http://localhost:3000"
echo "  Ahora agregá esto a tu config de nginx (ver nginx-api.conf)"
echo "============================================================"
echo ""
pm2 status

