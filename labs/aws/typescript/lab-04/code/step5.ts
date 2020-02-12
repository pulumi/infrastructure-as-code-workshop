import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

const ns = new k8s.core.v1.Namespace("app-ns", {
    metadata: { name: "joe-duffy" },
});

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

const service = new k8s.core.v1.Service("app-svc", {
    metadata: { namespace: ns.metadata.name },
    spec: {
        selector: appLabels,
        ports: [{ port: 80, targetPort: 8080 }],
        type: "LoadBalancer",
    },
});

const address = service.status.loadBalancer.ingress[0].hostname;
const port = service.spec.ports[0].port;
export const url = pulumi.interpolate`http://${address}:${port}`;
