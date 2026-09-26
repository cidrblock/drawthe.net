FROM node:24-bookworm-slim AS build

WORKDIR /opt/drawthe.net
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=production
WORKDIR /opt/drawthe.net

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY bin/ ./bin/
COPY public/images/ ./public/images/
COPY src/cli/ ./src/cli/
COPY src/renderer/ ./src/renderer/
COPY --from=build /opt/drawthe.net/dist/ ./dist/
COPY --from=build /opt/drawthe.net/examples/ ./dist/examples/
COPY --from=build /opt/drawthe.net/templates/ ./dist/templates/
COPY bin/container-entrypoint.sh /usr/local/bin/drawthe-net-container

RUN chmod 755 /usr/local/bin/drawthe-net-container \
  && mkdir /workspace \
  && chown node:node /workspace

WORKDIR /workspace
USER node
EXPOSE 5173

LABEL org.opencontainers.image.source="https://github.com/cidrblock/drawthe.net" \
  org.opencontainers.image.description="Render drawthe.net YAML diagrams or run the web editor" \
  org.opencontainers.image.licenses="MIT"

ENTRYPOINT ["/usr/local/bin/drawthe-net-container"]