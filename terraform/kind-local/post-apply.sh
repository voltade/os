CLUSTER_NAME="kind-voltade-os-local"

tofu output -raw kubeconfig >kubeconfig
kubecm delete $CLUSTER_NAME
kubecm add -f ./kubeconfig --cover
kubecm switch $CLUSTER_NAME

kubectl --context $CLUSTER_NAME -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d | pbcopy
echo "ArgoCD password copied to clipboard"

open http://argocd.127-0-0-1.sslip.io
