import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

const ns = new k8s.core.v1.Namespace("app-ns", {
    metadata: { name: "joe-duffy" },
});
