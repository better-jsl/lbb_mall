#!/bin/sh
set -eu

cd /opt/lbb_mall/backend
docker run --rm \
  -v backend_letsencrypt:/etc/letsencrypt \
  -v backend_certbot_webroot:/var/www/certbot \
  certbot/certbot renew --webroot -w /var/www/certbot
docker compose -f compose.cloud.yml -f compose.edge.yml exec -T nginx nginx -s reload
