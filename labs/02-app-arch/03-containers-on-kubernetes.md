# Deploying Containers to a Kubernetes Cluster

In this lab, you will deploy a containerized application to a Kubernetes cluster.

> This lab assumes you have a project set up. If you don't yet, please [complete this lab first](../01-iac/01-creating-a-new-project.md).

## Step 1 &mdash; Configure Access to a Cluster

Amazon EKS offers managed Kubernetes cluster hosting. This makes it easier to create and manage new clusters compared to doing so by hand. In this lab, you will deploy a load-balanced, containzerized application to an existing Kubernetes cluster.

If you are participating in an interactive workshop, you will most likely be given access to an existing EKS cluster. Save the `kubeconfig` file you were given to `~/iac-workshop/kubeconfig`.

> If you do not have an EKS cluster, you can create one by following the steps [here](https://github.com/pulumi/examples/tree/master/aws-ts-eks).

Point the `KUBECONFIG` environment variable at your cluster configuration file:

```bash
export KUBECONFIG=~/iac-workshop/kubeconfig
```

To test out connectivity, run `kubectl cluster-info`. You should see information similar to this:

```
Kubernetes master is running at https://abcxyz123.gr7.eu-central-1.eks.amazonaws.com
Heapster is running at https://abcxyz123.gr7.eu-central-1.eks.amazonaws.com/api/v1/namespaces/kube-system/services/heapster/proxy
CoreDNS is running at https://abcxyz123.gr7.eu-central-1.eks.amazonaws.com/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
monitoring-influxdb is running at https://abcxyz123.gr7.eu-central-1.eks.amazonaws.com/api/v1/namespaces/kube-system/services/monitoring-influxdb/proxy
```

## Step 2 &mdash; Install the Kubernetes Package

From your project's root directory, install the Kubernetes package:

```
npm install @pulumi/kubernetes
```

Next, add these imports to an empty `index.ts` file:

```typescript
import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";
```

> :white_check_mark: After this change, your `index.ts` should [look like this](./02-containers-on-kubernetes/step2.ts).

## Step 3 &mdash; Declare Your Application's Namespace Object

First, declare a [namespace object](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/). This will scope your objects to a name of your choosing, so that in this workshop you won't accidentally interfere with other participants.

Append this to your `index.ts` file, replacing `joe-duffy` with your own name:

```typescript
const ns = new k8s.core.v1.Namespace("app-ns", {
    metadata: { name: "joe-duffy" },
});
```

> :white_check_mark: After this change, your `index.ts` should [look like this](./02-containers-on-kubernetes/step3.ts).

## Step 4 &mdash; Declare Your Application's Deployment Object

You'll now declare a [deployment object](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/), which deploys a specific set of containers to the cluster and scales them. In this case, you'll deploy the pre-built `gcr.io/google-samples/kubernetes-bootcamp:v1` container image with only a single replica.

Append this to your `index.ts` file:

```typescript
...
const appLabels = { app: "iac-workshop" };
const deployment = new k8s.apps.v1.Deployment("app-dep", {
    metadata: { namespace: ns.metadata.name },
    spec: {
        selector: { matchLabels: appLabels },
        replicas: 1,
        template: {
            metadata: { labels: appLabels },
            spec: {
                containers: [{
                    name: "iac-workshop",
                    image: "gcr.io/google-samples/kubernetes-bootcamp:v1",
                }],
            },
        },
    },
});
```

> :white_check_mark: After this change, your `index.ts` should [look like this](./02-containers-on-kubernetes/step4.ts).

## Step 5 &mdash; Declare Your Application's Service Object

Next, you'll declare a [service object](https://kubernetes.io/docs/concepts/services-networking/service/), which enables networking and load balancing across your deployment replicas.

Append this to your `index.ts` file:

```typescript
...
const service = new k8s.core.v1.Service("app-svc", {
    metadata: { namespace: ns.metadata.name },
    spec: {
        selector: appLabels,
        ports: [{ port: 80, targetPort: 8080 }],
        type: "LoadBalancer",
    },
});
```

Afterwards, add these lines to export the resulting, dynamically assigned endpoint for the resulting load balancer:

```typescript
...
const address = service.status.loadBalancer.ingress[0].hostname;
const port = service.spec.ports[0].port;
export const url = pulumi.interpolate`http://${address}:${port}`;
```

> :white_check_mark: After these changes, your `index.ts` should [look like this](./02-containers-on-kubernetes/step5.ts).

## Step 6 &mdash; Deploy Everything

```bash
pulumi up
```

This will show you a preview and, after selecting `yes`, the application will be deployed:

```
Updating (dev):

     Type                           Name              Status
 +   pulumi:pulumi:Stack            iac-workshop-dev  created
 +   ├─ kubernetes:core:Namespace   app-ns            created
 +   ├─ kubernetes:core:Service     app-svc           created
 +   └─ kubernetes:apps:Deployment  app-dep           created

Outputs:
    url: "http://a413f76f2f82011e9962d024411cd1af-1680698210.eu-central-1.elb.amazonaws.com:80"

Resources:
    + 4 created

Duration: 22s

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
* Update the version of your application by changing its container image tag.

Note that the application says `Demo application version v0.10.0-blue` in the banner. After deploying, it will change to version `v0.10.0-green`.

First update your deployment's configuration's replica count:

```
...
        replicas: 3,
...
```

And then update its image to:

```
...
                    image: "jocatalin/kubernetes-bootcamp:v2",
...
```

> :white_check_mark: After this change, your `index.ts` should [look like this](./02-containers-on-kubernetes/step7.ts).

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
          ~ template: {
              ~ spec: {
                  ~ containers: [
                      ~ [0]: {
                              ~ image: "gcr.io/google-samples/kubernetes-bootcamp:v1" => "jocatalin/kubernetes-bootcamp:v2"
                            }
                    ]
                }
            }
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

And verify that the output now ends in `v=2`, instead of `v=1` (the result of the new container image):

```
Hello Kubernetes bootcamp! | Running on: app-dep-8r1febnu-6cd57d964-c76rx | v=2
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

Next, choose amongst these labs:

* [Provisioning EC2 Virtual Machines](../02-app-arch/01-provisioning-vms.md)
* [Deploying Containers to Elastic Container Service (ECS) "Fargate"](../02-app-arch/02-containers-on-ecs.md)
* [Using AWS Lambda for Serverless Application Patterns](../02-app-arch/04-lambda-serverless.md)

Or view the [suggested next steps](/#next-steps) after completing all labs.
