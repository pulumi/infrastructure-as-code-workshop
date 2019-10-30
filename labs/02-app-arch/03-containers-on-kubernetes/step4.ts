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
