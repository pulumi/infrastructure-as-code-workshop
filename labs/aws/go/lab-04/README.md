# Deploying Containers to a Kubernetes Cluster

In this lab, you will deploy a containerized application to a Kubernetes cluster.

> This lab assumes you have a project set up. If you don't yet, please [complete this lab first](../01-iac/01-creating-a-new-project.md).

## Step 1 &mdash; Creating a Kubernetes Cluster

> If you do not have an EKS cluster, you can create one by using the code [here](./code/step1.go).

If you have created your EKS Cluster using Pulumi, then you can export your KubeConfig as follows:

```bash
pulumi stack output kubeconfig > ~/iac-workshop/kubeconfig.json
```

Point the `KUBECONFIG` environment variable at your cluster configuration file:

```bash
export KUBECONFIG=~/iac-workshop/kubeconfig
```

To test out connectivity, run `kubectl cluster-info`. You should see information similar to this:

```
Kubernetes master is running at https://abcxyz123.gr7.eu-central-1.eks.amazonaws.com
CoreDNS is running at https://abcxyz123.gr7.eu-central-1.eks.amazonaws.com/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
```

## Step 2 &mdash; Install the Kubernetes Package

From your project's root directory, install the Kubernetes package:

```
GO111MODULE=on go get github.com/pulumi/pulumi-kubernetes
```

Next, add these imports to your `main.go` file:

```go
appsv1 "github.com/pulumi/pulumi-kubernetes/sdk/go/kubernetes/apps/v1"
corev1 "github.com/pulumi/pulumi-kubernetes/sdk/go/kubernetes/core/v1"
metav1 "github.com/pulumi/pulumi-kubernetes/sdk/go/kubernetes/meta/v1"
```

We need to declare a new Kubernetes Provider based on the KubeConfig created in step1. To do this, add this to your `main.go` file

```go
k8sProvider, err := providers.NewProvider(ctx, "k8sprovider", &providers.ProviderArgs{
    Kubeconfig: generateKubeconfig(eksCluster.Endpoint,
        eksCluster.CertificateAuthority.Data().Elem(), eksCluster.Name),
}, pulumi.DependsOn([]pulumi.Resource{nodeGroup}))
if err != nil {
    return err
}
```

> :white_check_mark: After this change, your `main.go` should [look like this](./code/step2.go).

## Step 3 &mdash; Declare Your Application's Namespace Object

First, declare a [namespace object](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/). This will scope your objects to a name of your choosing, so that in this workshop you won't accidentally interfere with other participants.

Append this to your `main.go` file, replacing `joe-duffy` with your own name and referencing the Provider created in step2:

```go
namespace, err := corev1.NewNamespace(ctx, "app-ns", &corev1.NamespaceArgs{
    Metadata: &metav1.ObjectMetaArgs{
        Name: pulumi.String("joe-duffy"),
    },
}, pulumi.Provider(k8sProvider))
if err != nil {
    return err
}
```

> :white_check_mark: After this change, your `main.go` should [look like this](./code/step3.go).

## Step 4 &mdash; Declare Your Application's Deployment Object

You'll now declare a [deployment object](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/), which deploys a specific set of containers to the cluster and scales them. In this case, you'll deploy the pre-built `gcr.io/google-samples/kubernetes-bootcamp:v1` container image with only a single replica.

Append this to your `main.go` file:

```go
appLabels := pulumi.StringMap{
    "app": pulumi.String("iac-workshop"),
}
_, err = appsv1.NewDeployment(ctx, "app-dep", &appsv1.DeploymentArgs{
    Metadata: &metav1.ObjectMetaArgs{
        Namespace: namespace.Metadata.Elem().Name(),
    },
    Spec: appsv1.DeploymentSpecArgs{
        Selector: &metav1.LabelSelectorArgs{
            MatchLabels: appLabels,
        },
        Replicas: pulumi.Int(3),
        Template: &corev1.PodTemplateSpecArgs{
            Metadata: &metav1.ObjectMetaArgs{
                Labels: appLabels,
            },
            Spec: &corev1.PodSpecArgs{
                Containers: corev1.ContainerArray{
                    corev1.ContainerArgs{
                        Name:  pulumi.String("iac-workshop"),
                        Image: pulumi.String("jocatalin/kubernetes-bootcamp:v2"),
                    }},
            },
        },
    },
}, pulumi.Provider(k8sProvider))
if err != nil {
    return err
}
)
```

> :white_check_mark: After this change, your `main.go` should [look like this](./code/step4.go).

## Step 5 &mdash; Declare Your Application's Service Object

Next, you'll declare a [service object](https://kubernetes.io/docs/concepts/services-networking/service/), which enables networking and load balancing across your deployment replicas.

Append this to your `main.go` file:

```go
service, err := corev1.NewService(ctx, "app-service", &corev1.ServiceArgs{
    Metadata: &metav1.ObjectMetaArgs{
        Namespace: namespace.Metadata.Elem().Name(),
        Labels:    appLabels,
    },
    Spec: &corev1.ServiceSpecArgs{
        Ports: corev1.ServicePortArray{
            corev1.ServicePortArgs{
                Port:       pulumi.Int(80),
                TargetPort: pulumi.Int(8080),
            },
        },
        Selector: appLabels,
        Type:     pulumi.String("LoadBalancer"),
    },
}, pulumi.Provider(k8sProvider))
if err != nil {
    return err
}
```

Afterwards, add these lines to export the resulting, dynamically assigned endpoint for the resulting load balancer:

```go
ctx.Export("url", service.Status.ApplyT(func(status *corev1.ServiceStatus) *string {
    ingress := status.LoadBalancer.Ingress[0]
    if ingress.Hostname != nil {
        return ingress.Hostname
    }
    return ingress.Ip
}))
```

> :white_check_mark: After these changes, your `main.go` should [look like this](./code/step5.go).

## Step  &mdash; Deploy Everything

```bash
pulumi up
```

This will show you a preview and, after selecting `yes`, the application will be deployed:

```
Updating (dev):

     Type                             Name                                    Status
 +   pulumi:pulumi:Stack              python-testing-dev                      created
 +   ├─ aws:iam:Role                  eks-nodegroup-role                      created
 +   ├─ aws:iam:Role                  eks-service-role                        created
 +   ├─ aws:iam:RolePolicyAttachment  eks-service-role-4b490823               created
 +   ├─ aws:iam:RolePolicyAttachment  eks-service-role-c05aa93d               created
 +   ├─ aws:iam:RolePolicyAttachment  eks-nodegroup-role-5924e9b1             created
 +   ├─ aws:iam:RolePolicyAttachment  eks-nodegroup-role-defaaaa0             created
 +   ├─ aws:iam:RolePolicyAttachment  eks-nodegroup-role-f878e9dc             created
 +   ├─ aws:ec2:SecurityGroup         eks-cluster-security-group              created
 +   ├─ aws:ec2:SecurityGroupRule     eks-cluster-security-group-egress-rule  created
 +   ├─ aws:eks:Cluster               eks-cluster                             created
 +   ├─ aws:eks:NodeGroup             eks-node-group                          created
 +   ├─ pulumi:providers:kubernetes   k8s-provider                            created
 +   ├─ kubernetes:core:Namespace     app-ns                                  created
 +   ├─ kubernetes:core:Service       app-service                             created
 +   └─ kubernetes:apps:Deployment    app-dep                                 created

Outputs:
    url: "http://ae7c37b7c510511eab4540a6f2211784-521581596.us-west-2.elb.amazonaws.com:80"

Resources:
    + 16 created

Duration: 12m50s

Permalink: https://app.pulumi.com/joeduffy/iac-workshop/dev/updates/1
```

List the pods in your namespace, again replacing `joe-duffy` with the namespace you chose earlier:

```bash
kubectl get pods --namespace joe-duffy
```

And you should see a single replica:

```
NAME                                READY   STATUS    RESTARTS   AGE
app-dep-8r1febnu-66bffbf565-vx9kv   1/1     Running   0          0m15s
```

Curl the resulting endpoint to view the application:

```bash
curl $(pulumi stack output url)
```

You should see something like the following:

```
Hello Kubernetes bootcamp! | Running on: app-dep-8r1febnu-66bffbf565-vx9kv | v=1
```

> Kubernetes does not wait until the AWS load balancer is fully initialized, so it may take a few minutes before it becomes available.

## Step 7 &mdash; Update Your Application Configuration

Next, you'll make two changes to the application:

* Scale out to 3 replicas, instead of just 1.

Update your deployment's configuration's replica count:

```
...
        Replicas: pulumi.Int(3),
...
```

> :white_check_mark: After this change, your `main.go` should [look like this](./code/step7.go).

Deploy your updates:

```bash
pulumi up
```

This will show you that the deployment has changed:

```
Previewing update (dev):

     Type                           Name              Plan       Info
     pulumi:pulumi:Stack            iac-workshop-dev
 ~   └─ kubernetes:apps:Deployment  app-dep           update     [diff: ~spec]

Resources:
    ~ 1 to update
    3 unchanged

Do you want to perform this update?
  yes
> no
  details
```

Selecting `details` will reveal the two changed made above:

```
  pulumi:pulumi:Stack: (same)
    [urn=urn:pulumi:dev::iac-workshop::pulumi:pulumi:Stack::iac-workshop-dev]
    ~ kubernetes:apps/v1:Deployment: (update)
        [id=joe-duffy/app-dep-8r1febnu]
        [urn=urn:pulumi:dev::iac-workshop::kubernetes:apps/v1:Deployment::app-dep]
        [provider=urn:pulumi:dev::iac-workshop::pulumi:providers:kubernetes::default_1_2_3::c2145624-bf5a-4e9e-97c6-199096da4c67]
      ~ spec: {
          ~ replicas: 1 => 3
        }

Do you want to perform this update?
  yes
> no
  details
```

And selecting `yes` will apply them:

```
Updating (dev):

     Type                           Name              Status      Info
     pulumi:pulumi:Stack            iac-workshop-dev
 ~   └─ kubernetes:apps:Deployment  app-dep           updated     [diff: ~spec]

Outputs:
    url: "http://ae33950ecf82111e9962d024411cd1af-422878052.eu-central-1.elb.amazonaws.com:80"

Resources:
    ~ 1 updated
    3 unchanged

Duration: 16s

Permalink: https://app.pulumi.com/joeduffy/iac-workshop/dev/updates/2
```

Query the pods again using your chosen namespace from earlier:

```bash
kubectl get pods --namespace joe-duffy
```

Check that there are now three:

```
NAME                               READY   STATUS    RESTARTS   AGE
app-dep-8r1febnu-6cd57d964-c76rx   1/1     Running   0          8m45s
app-dep-8r1febnu-6cd57d964-rdpn6   1/1     Running   0          8m35s
app-dep-8r1febnu-6cd57d964-tj6m4   1/1     Running   0          8m56s
```

Finally, curl the endpoint again:

```bash
curl $(pulumi stack output url)
```

If you'd like, do it a few more times, and observe that traffic will be load balanced across the three pods:

```bash
for i in {0..10}; do curl $(pulumi stack output url); done
```

## Step 8 &mdash; Destroy Everything

Finally, destroy the resources and the stack itself:

```
pulumi destroy
pulumi stack rm
```

## Next Steps

Congratulations! :tada: You've deployed a Kubernetes application to an existing EKS cluster, scaled it out, and performed a rolling update of the container image it is running.

Next, view the [suggested next steps](../../../../README.md#next-steps) after completing all labs.
