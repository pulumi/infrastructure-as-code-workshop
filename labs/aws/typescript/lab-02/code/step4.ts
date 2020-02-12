import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const ami = aws.getAmi({
    filters: [{ name: "name", values: ["amzn-ami-hvm-*-x86_64-ebs"] }],
    owners: [ "137112412989" ],
    mostRecent: true,
}).then(ami => ami.id);

const sg = new aws.ec2.SecurityGroup("web-secgrp", {
    ingress: [
        { protocol: "icmp", fromPort: 8, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
    ],
});

const alb = new awsx.lb.ApplicationLoadBalancer("web-traffic", {
    external: true,
    securityGroups: [ sg.id ],
});
const listener = alb.createListener("web-listener", { port: 80 });

export const ips: any[] = [];
export const hostnames: any[] = [];
for (const az of aws.getAvailabilityZones().names) {
    const server = new aws.ec2.Instance(`web-server-${az}`, {
        instanceType: "t2.micro",
        securityGroups: alb.securityGroups.map(sg => sg.securityGroup.name),
        ami: ami,
        availabilityZone: az,
        userData: "#!/bin/bash\n"+
            `echo 'Hello, World -- from ${az}!' > index.html\n` +
            "nohup python -m SimpleHTTPServer 80 &",
        tags: { "Name": "web-server" },
    });
    ips.push(server.publicIp);
    hostnames.push(server.publicDns);

    alb.attachTarget(`web-target-${az}`, server);
}

export const url = listener.endpoint.hostname;
