#!/bin/sh
# compress.sh <key> [texture-size]
# Raw GLB from Blender -> public/models/<key>.glb (meshopt geometry, webp texture).
set -e
key="$1"; size="${2:-1024}"
cd "$(dirname "$0")/.."
gltf-transform optimize "blender/raw/$key.glb" "public/models/$key.glb" \
  --compress meshopt --texture-compress webp --texture-size "$size" \
  --simplify false --instance false --join false --flatten false
ls -l "public/models/$key.glb" | awk '{print $5, $9}'
