#!/bin/sh
set -eu

CERT_DIR="/etc/nginx/certs"
CERT_FILE="$CERT_DIR/server.crt"
KEY_FILE="$CERT_DIR/server.key"

mkdir -p "$CERT_DIR"

if [ ! -f "$CERT_FILE" ] || [ ! -f "$KEY_FILE" ]; then
  echo "No TLS certificate found. Generating a self-signed certificate for e8-kb."
  openssl req -x509 -nodes -newkey rsa:4096 -days 3650 \
    -keyout "$KEY_FILE" \
    -out "$CERT_FILE" \
    -subj "/C=AU/O=Essential 8 Knowledge Base/CN=e8-kb"
  chmod 600 "$KEY_FILE"
  echo "Self-signed certificate created. To use a trusted certificate, mount server.crt and server.key into /etc/nginx/certs."
fi

exec nginx -g "daemon off;"

