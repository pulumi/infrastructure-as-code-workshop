from pulumi import export, StackReference, Output, ResourceOptions
from pulumi_kubernetes import Provider
from pulumi_kubernetes.apps.v1 import Deployment
from pulumi_kubernetes.core.v1 import Service, Namespace
import pulumi

# Create StackReference to the Kubernetes cluster stack
config  = pulumi.Config()
stackRef = config.require("clusterStackRef");
infra = StackReference(f"{stackRef}")

# Declare a provider using the KubeConfig we created
# This will be used to interact with the EKS cluster
kubeconfig = infra.get_output("kubeconfig").apply(lambda c: json.dumps(c))
k8s_provider = Provider("k8s-provider", kubeconfig=kubeconfig)

# Create a Namespace object https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/
ns = Namespace("app-ns",
    metadata={
       "name": "joe-duffy",
    },
    opts=ResourceOptions(provider=k8s_provider)
)
