SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export KUBECONFIG="$SCRIPT_DIR/../../../terraform/kind-local/kubeconfig"

ENV_FILE="$SCRIPT_DIR/../.env"
ENV_EXAMPLE="$SCRIPT_DIR/../.env.example"
if [ ! -f "$ENV_FILE" ]; then
  cp "$ENV_EXAMPLE" "$ENV_FILE"
fi

# Determine the list of namespaces which match the pattern for organization namespaces.
NAMESPACES=$(kubectl get namespaces -o json | jq -r '.items[].metadata.name' | grep -E '^org-[a-zA-Z0-9]{7}-[a-zA-Z0-9]{8}$')

# Ask the user to choose a namespace from the list. If there is only one, automatically pre-select it.
if [ $(echo "$NAMESPACES" | wc -l) -eq 1 ]; then
  echo "Only one namespace" "$(echo "$NAMESPACES")" "was found, using it..."
  SELECTED_NAMESPACE="$NAMESPACES"
else
  echo "Available namespaces:"
  echo "$NAMESPACES"
  # TODO: Improve the developer experience by using a select menu.
  read -p "Please select a namespace: " SELECTED_NAMESPACE
fi

DB_PASSWORD=$(kubectl get secret -n "$SELECTED_NAMESPACE" cnpg-cluster-app -o jsonpath="{.data.password}" | base64 -d)

sed -i '' "s/^DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" "$ENV_FILE"

kubectl cnpg psql cnpg-cluster \
  -n "$SELECTED_NAMESPACE" \
  -- -c "drop database app with (force)"

kubectl patch database app \
  --type='merge' \
  -n "$SELECTED_NAMESPACE" \
  -p '{"spec":{"ensure":"absent"}}'

kubectl patch database app \
  --type='merge' \
  -n "$SELECTED_NAMESPACE" \
  -p '{"spec":{"ensure":"present"}}'

kubectl cnpg psql cnpg-cluster \
  -n "$SELECTED_NAMESPACE" \
  -- \
  -d app \
  -c "
create schema if not exists extensions;
create extension supabase_vault cascade;
grant usage on schema vault to app;
grant execute on all functions in schema vault to app;
grant select on all tables in schema vault to app;
grant references on all tables in schema vault to app;
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all routines in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
"
