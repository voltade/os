#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"
ENV_EXAMPLE="$SCRIPT_DIR/../.env.example"

STORE_NAME="core"
MODEL_FILE="$SCRIPT_DIR/../openfga/fga.mod"

# Ensure .env exists
if [ ! -f "$ENV_FILE" ] && [ -f "$ENV_EXAMPLE" ]; then
  cp "$ENV_EXAMPLE" "$ENV_FILE"
fi

# Check connectivity
echo "🔎 Checking OpenFGA connectivity..."
if ! fga store list >/dev/null 2>&1; then
  echo "❌ Cannot reach FGA server (fga store list failed)"
  exit 1
fi
echo "✅ FGA reachable"

# Check if store exists
STORE_ID=$(fga store list | jq -r --arg name "$STORE_NAME" '.stores[]? | select(.name == $name) | .id')

if [ -n "$STORE_ID" ]; then
  echo "🗑️  Store '$STORE_NAME' exists ($STORE_ID), deleting..."
  fga store delete --store-id "$STORE_ID"
fi

# Create store
echo "✨ Creating store '$STORE_NAME'..."
STORE_ID=$(fga store create --name "$STORE_NAME" | jq -r '.id // .store.id')
echo "✅ Store created with id: $STORE_ID"

# Write to .env (BSD/macOS sed style, adjust if GNU)
sed -i '' "s/^FGA_STORE_ID=.*/FGA_STORE_ID=$STORE_ID/" "$ENV_FILE" || echo "FGA_STORE_ID=$STORE_ID" >> "$ENV_FILE"

# Upload model
echo "📦 Writing model from $MODEL_FILE..."
WRITE_OUT=$(fga model write --store-id "$STORE_ID" --file "$MODEL_FILE")
MODEL_ID=$(echo "$WRITE_OUT" | jq -r '.authorization_model_id // .model_id')

if [ -z "$MODEL_ID" ]; then
  echo "❌ Failed to get model id"
  exit 1
fi
echo "✅ Model written with id: $MODEL_ID"

# Save model id
sed -i '' "s/^FGA_AUTHORIZATION_MODEL_ID=.*/FGA_AUTHORIZATION_MODEL_ID=$MODEL_ID/" "$ENV_FILE" || echo "FGA_AUTHORIZATION_MODEL_ID=$MODEL_ID" >> "$ENV_FILE"

echo "📝 Updated $ENV_FILE with:"
echo "   FGA_STORE_ID=$STORE_ID"
echo "   FGA_AUTHORIZATION_MODEL_ID=$MODEL_ID"
