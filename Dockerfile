# syntax=docker/dockerfile:1
# Sitio y panel de ReaperSys (Next.js, salida standalone). Construir desde la RAÍZ del monorepo:
#   docker build -f frontend/Dockerfile \
#     --build-arg NEXT_PUBLIC_API_URL=https://api.tudominio.com/api/v1 \
#     --build-arg NEXT_PUBLIC_SITE_URL=https://tudominio.com \
#     -t reapersys-web .
# Las variables NEXT_PUBLIC_* se incrustan en el código del navegador al compilar.
ARG NODE_IMAGE=node:24.22.0-alpine

FROM ${NODE_IMAGE} AS build
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
# puppeteer-core (pruebas E2E) no descarga navegadores; no se necesita Chrome en la imagen.
RUN npm ci --workspace @reapersys/frontend --include-workspace-root --no-audit --no-fund
COPY frontend/ frontend/
RUN test -n "$NEXT_PUBLIC_API_URL" && test -n "$NEXT_PUBLIC_SITE_URL" \
  || (echo "Faltan NEXT_PUBLIC_API_URL y/o NEXT_PUBLIC_SITE_URL" && exit 1)
RUN npm run build --workspace @reapersys/frontend

# ---------------------------------------------------------------- imagen final
FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
WORKDIR /app
# El servidor standalone incluye solo los módulos que realmente usa la aplicación.
COPY --from=build --chown=node:node /app/frontend/.next/standalone ./
COPY --from=build --chown=node:node /app/frontend/.next/static ./frontend/.next/static
COPY --from=build --chown=node:node /app/frontend/public ./frontend/public
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/robots.txt').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "frontend/server.js"]
