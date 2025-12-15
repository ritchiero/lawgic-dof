#!/bin/bash

echo "================================================"
echo "  Instalación del Sistema de Imágenes Hero"
echo "  Lawgic DOF - Feed Instagram-Style"
echo "================================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Instalar dependencias
echo -e "${YELLOW}[1/6] Instalando dependencias...${NC}"
pnpm add uuid @google/generative-ai
pnpm add -D @types/uuid

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
else
    echo -e "${RED}❌ Error instalando dependencias${NC}"
    exit 1
fi

echo ""

# 2. Verificar archivos necesarios
echo -e "${YELLOW}[2/6] Verificando archivos del sistema...${NC}"

FILES=(
    "lib/services/image-generator.ts"
    "lib/services/image-storage.ts"
    "components/DocumentCardWithImage.tsx"
    "lib/firebase.ts"
    "lib/types.ts"
    "app/api/jobs/daily/route.ts"
)

ALL_FILES_EXIST=true
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file (falta)${NC}"
        ALL_FILES_EXIST=false
    fi
done

if [ "$ALL_FILES_EXIST" = false ]; then
    echo -e "${RED}❌ Faltan archivos necesarios${NC}"
    exit 1
fi

echo ""

# 3. Verificar variables de entorno
echo -e "${YELLOW}[3/6] Verificando variables de entorno...${NC}"

if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  Archivo .env.local no encontrado${NC}"
    echo -e "${YELLOW}   Copiando .env.example a .env.local...${NC}"
    cp .env.example .env.local
    echo -e "${YELLOW}   Por favor, edita .env.local con tus credenciales${NC}"
else
    echo -e "${GREEN}✅ Archivo .env.local existe${NC}"
fi

# Verificar variables críticas
REQUIRED_VARS=(
    "FIREBASE_PROJECT_ID"
    "FIREBASE_CLIENT_EMAIL"
    "FIREBASE_PRIVATE_KEY"
    "FIREBASE_STORAGE_BUCKET"
)

source .env.local 2>/dev/null

MISSING_VARS=false
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Variable $var no configurada${NC}"
        MISSING_VARS=true
    else
        echo -e "${GREEN}✅ Variable $var configurada${NC}"
    fi
done

if [ "$MISSING_VARS" = true ]; then
    echo -e "${YELLOW}⚠️  Por favor, configura las variables faltantes en .env.local${NC}"
fi

echo ""

# 4. Actualizar imports en feed
echo -e "${YELLOW}[4/6] Actualizando imports en feed...${NC}"

FEED_FILE="app/feed/page.tsx"

if [ -f "$FEED_FILE" ]; then
    # Backup del archivo original
    cp "$FEED_FILE" "$FEED_FILE.backup"
    
    # Reemplazar import
    sed -i "s|from '@/components/DocumentCard'|from '@/components/DocumentCardWithImage'|g" "$FEED_FILE"
    
    echo -e "${GREEN}✅ Imports actualizados (backup creado en $FEED_FILE.backup)${NC}"
else
    echo -e "${RED}❌ Archivo $FEED_FILE no encontrado${NC}"
fi

echo ""

# 5. Verificar configuración de Firebase Storage
echo -e "${YELLOW}[5/6] Verificando Firebase Storage...${NC}"
echo -e "${YELLOW}   Asegúrate de que Firebase Storage esté habilitado en Firebase Console${NC}"
echo -e "${YELLOW}   URL: https://console.firebase.google.com/project/$FIREBASE_PROJECT_ID/storage${NC}"

echo ""

# 6. Resumen
echo -e "${YELLOW}[6/6] Resumen de instalación${NC}"
echo ""
echo -e "${GREEN}✅ Sistema de imágenes hero instalado${NC}"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo "  1. Configura las variables de entorno en .env.local"
echo "  2. Habilita Firebase Storage en Firebase Console"
echo "  3. Configura las reglas de seguridad de Storage"
echo "  4. Ejecuta: pnpm dev"
echo "  5. Prueba la generación de imágenes"
echo ""
echo -e "${YELLOW}Para probar la generación de imágenes:${NC}"
echo "  npx tsx scripts/test-image-generation.ts"
echo ""
echo -e "${YELLOW}Para migrar documentos existentes:${NC}"
echo "  npx tsx scripts/migrate-existing-docs.ts"
echo ""
echo "================================================"
echo -e "${GREEN}  ✅ Instalación completada${NC}"
echo "================================================"
