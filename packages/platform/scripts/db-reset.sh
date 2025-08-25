SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export KUBECONFIG="$SCRIPT_DIR/../../../terraform/kind-local/kubeconfig"

ENV_FILE="$SCRIPT_DIR/../.env"
ENV_EXAMPLE="$SCRIPT_DIR/../.env.example"
if [ ! -f "$ENV_FILE" ]; then
  cp "$ENV_EXAMPLE" "$ENV_FILE"
fi

DB_PASSWORD=$(kubectl get secret -n platform cnpg-platform-admin -o jsonpath="{.data.password}" | base64 -d)

sed -i '' "s/^DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" "$ENV_FILE"

kubectl cnpg psql cnpg-cluster \
  -n platform \
  -- -c "drop database if exists platform with (force)"

kubectl patch database platform \
  --type='merge' \
  -n platform \
  -p '{"spec":{"ensure":"absent"}}'

kubectl patch database platform \
  --type='merge' \
  -n platform \
  -p '{"spec":{"ensure":"present"}}'

kubectl cnpg psql cnpg-cluster \
  -n platform \
  -- \
  -d platform \
  -c "
create extension supabase_vault cascade;
grant usage on schema vault to platform_admin;
grant execute on all functions in schema vault to platform_admin;
grant select on all tables in schema vault to platform_admin;
grant references on all tables in schema vault to platform_admin;
"
