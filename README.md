# grc
Gestión de riesgo

Sitio publicado: https://mariagutierrez-dot.github.io/grc/

## Ejecutar en local

**Requisitos:** Node.js

1. Instalar dependencias: `npm install`
2. Definir `GEMINI_API_KEY` en `.env.local` (necesario para el plan de acción con IA)
3. Ejecutar: `npm run dev`

## Despliegue

Cada push a `main` compila el front con Vite y lo publica en GitHub Pages
(`.github/workflows/deploy-pages.yml`). El endpoint `/api/generate-action-plan`
de `server.ts` no está disponible en Pages.
