FROM node:24-bookworm-slim

ENV NODE_ENV=production
WORKDIR /opt/drawthe.net

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY bin/ ./bin/
COPY public/images/ ./public/images/
COPY src/cli/ ./src/cli/
COPY src/renderer/ ./src/renderer/

RUN mkdir /workspace && chown node:node /workspace
WORKDIR /workspace
USER node

LABEL org.opencontainers.image.source="https://github.com/cidrblock/drawthe.net" \
  org.opencontainers.image.description="Render drawthe.net YAML diagrams to SVG" \
  org.opencontainers.image.licenses="MIT"

ENTRYPOINT ["node", "/opt/drawthe.net/bin/drawthe-net.js"]