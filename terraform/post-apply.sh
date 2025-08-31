CLUSTER_NAME="kind-voltade-os-local"

tofu output -raw kubeconfig >kubeconfig
kubecm delete $CLUSTER_NAME
kubecm add -f ./kubeconfig --cover
kubecm switch $CLUSTER_NAME

open http://argocd.127.0.0.1.nip.io
