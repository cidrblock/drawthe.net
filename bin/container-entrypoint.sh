#!/bin/sh
set -eu

if [ "${1:-}" = "ui" ]; then
  shift
  exec /opt/drawthe.net/node_modules/.bin/sirv /opt/drawthe.net/dist --host 0.0.0.0 --port "${PORT:-5173}" "$@"
fi

exec node /opt/drawthe.net/bin/drawthe-net.js "$@"