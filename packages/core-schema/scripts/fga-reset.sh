#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"
ENV_EXAMPLE="$SCRIPT_DIR/../.env.example"

STORE_NAME="core"
MODEL_FILE="$SCRIPT_DIR/../openfga/fga.mod"

# Ensure .env exists
if [ ! -f "$ENV_FILE" ]; then
  if [ -f "$ENV_EXAMPLE" ]; then
    cp "$ENV_EXAMPLE" "$ENV_FILE"
  else
    touch "$ENV_FILE"
  fi
fi

# 1) Connectivity check (ensure your fga CLI is configured/authenticated)
echo "🔎 Checking OpenFGA connectivity..."
fga store list >/dev/null
echo "✅ FGA reachable"

# 2) Find store 'core' (if exists, delete WITHOUT prompt)
STORE_ID="$(fga store list | jq -r --arg name "$STORE_NAME" '.stores[]? | select(.name == $name) | .id')"
if [ -n "${STORE_ID:-}" ]; then
  echo "🗑️  Deleting existing store '$STORE_NAME' ($STORE_ID) ..."
  fga store delete --store-id "$STORE_ID" --force
fi

# 3) Create fresh store
echo "✨ Creating store '$STORE_NAME'..."
CREATE_OUT="$(fga store create --name "$STORE_NAME")"
STORE_ID="$(echo "$CREATE_OUT" | jq -r '.id // .store.id')"
if [ -z "$STORE_ID" ]; then
  echo "❌ Failed to create store '$STORE_NAME'"
  echo "$CREATE_OUT"
  exit 1
fi
echo "✅ Store created: $STORE_ID"

# 4) Persist FGA_STORE_ID to .env (macOS/BSD sed; will append if key missing)
if grep -q '^FGA_STORE_ID=' "$ENV_FILE"; then
  sed -i '' "s|^FGA_STORE_ID=.*|FGA_STORE_ID=$STORE_ID|" "$ENV_FILE"
else
  echo "FGA_STORE_ID=$STORE_ID" >> "$ENV_FILE"
fi

# 5) Write model
if [ ! -f "$MODEL_FILE" ]; then
  echo "❌ Model file not found: $MODEL_FILE"
  exit 1
fi

echo "📦 Writing model from $MODEL_FILE ..."
WRITE_OUT="$(fga model write --store-id "$STORE_ID" --file "$MODEL_FILE")"
MODEL_ID="$(echo "$WRITE_OUT" | jq -r '.authorization_model_id // .model_id')"
if [ -z "$MODEL_ID" ]; then
  echo "❌ Could not determine authorization_model_id from write output:"
  echo "$WRITE_OUT"
  exit 1
fi
echo "✅ Model id: $MODEL_ID"

# 6) Persist FGA_AUTHORIZATION_MODEL_ID to .env
if grep -q '^FGA_AUTHORIZATION_MODEL_ID=' "$ENV_FILE"; then
  sed -i '' "s|^FGA_AUTHORIZATION_MODEL_ID=.*|FGA_AUTHORIZATION_MODEL_ID=$MODEL_ID|" "$ENV_FILE"
else
  echo "FGA_AUTHORIZATION_MODEL_ID=$MODEL_ID" >> "$ENV_FILE"
fi

echo "📝 Updated $ENV_FILE with:"
echo "    FGA_STORE_ID=$STORE_ID"
echo "    FGA_AUTHORIZATION_MODEL_ID=$MODEL_ID"
echo "✅ Done."
