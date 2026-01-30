#!/bin/bash

echo "🏗️  Building proyecto..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build exitoso"
  echo "🚀 Desplegando a Firebase..."
  firebase deploy
  
  if [ $? -eq 0 ]; then
    echo "✅ Deploy completado!"
    echo "🌐 URL: https://espuela-test.web.app"
  else
    echo "❌ Error en deploy"
    exit 1
  fi
else
  echo "❌ Error en build"
  exit 1
fi
