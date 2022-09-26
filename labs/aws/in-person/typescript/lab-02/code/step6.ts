import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

// get Function for AMI
const myami = aws.ec2.getAmi({
    filters: [{ name: "name", values: ["amzn2-ami-k*-hvm-*-x86_64-gp2"] }],
    owners: [ "amazon" ],
    mostRecent: true,
});

// Exporting AMI_ID
export const ami_id = myami.then(ami=>ami.id);

// Variable we will use for naming purpose
const name = "demo";

// Creating a VPC with a Single Nat Gateway  Strategy (To save cost)
const myvpc = new awsx.ec2.Vpc(`${name}-vpc`, {
    cidrBlock: "10.0.0.0/24",
    numberOfAvailabilityZones: 3,
    enableDnsHostnames: true,
    natGateways: {
      strategy: "Single", // This is mainly to save cost. You do this only in dev
    },
  });

// VPC Outputs
export const vpc_id = myvpc.vpcId;
export const vpc_natgateways = myvpc.natGateways[0].id;
export const vpc_public_subnetids = myvpc.publicSubnetIds;
export const vpc_private_subnetids = myvpc.privateSubnetIds;

// Creating Security Group within VPC
const mysecuritygroup = new aws.ec2.SecurityGroup(`${name}-securitygroup`, {
    vpcId:myvpc.vpcId,
    ingress: [
        { protocol: "tcp", 
          fromPort: 443, 
          toPort: 443, 
          cidrBlocks: ["0.0.0.0/0"],
          description: "Allow inbound access via https",
          self: true, // Add the securitygroup itself as a source
        },
        { 
        protocol: "tcp", 
        fromPort: 80, 
        toPort: 80, 
        cidrBlocks: ["0.0.0.0/0"],
        description: "Allow inbound access via http",
        self: true, // Add the securitygroup itself as a source
      },
    ],
    egress: [
      { protocol: "tcp", 
          fromPort: 443, 
          toPort: 443, 
          cidrBlocks: ["0.0.0.0/0"],
          description: "Allow outbound access via https" 
        },
        { 
        protocol: "tcp", 
        fromPort: 80, 
        toPort: 80, 
        cidrBlocks: ["0.0.0.0/0"],
        description: "Allow outbound access via http" 
      },
  ],
  tags: {"Name": `${name}-securitygroup`},
}, { parent: myvpc, dependsOn: myvpc });

// Exporting security group outputs
export const security_group_name = mysecuritygroup.id;
export const security_group_vpc = mysecuritygroup.vpcId;
export const security_group_egress = mysecuritygroup.egress;
export const security_group_ingress = mysecuritygroup.ingress;

// ALB via AWSX
const alb = new awsx.lb.ApplicationLoadBalancer(`${name}-alb-web-traffic`, {
  enableHttp2: true,
  subnetIds: [vpc_public_subnetids[0],vpc_public_subnetids[1],vpc_public_subnetids[2]],  // You have to pass in subnetsids otherwise this will get created in the default subnet.
  securityGroups: [ mysecuritygroup.id ],  
  listener: {port: 80},
});

export const application_load_balancer_name = alb.loadBalancer.name;

// Single ec2 instance
const myserver = new aws.ec2.Instance(`${name}-web-server`, {
  ami: ami_id,
  instanceType: "t2.nano",
  subnetId: vpc_public_subnetids[0],
  vpcSecurityGroupIds: [mysecuritygroup.id],
  tags: { Name: `${name}-web-server` },
  userData:
    "#!/bin/bash\n" +
    "echo 'Hello, World!' > index.html\n" +
    "nohup python -m SimpleHTTPServer 80 &",
});

export const ip = myserver.publicIp;
export const hostname = myserver.publicDns;

// Ec2 servers spread across each az(public in this case)
export const ips: any[] = [];
export const hostnames: any[] = [];

//for (let z = 0; z < 3; z++ ) // In case you want more number of servers per az
  for (let x = 0; x < 3; x++ ) {
    const myserver = new aws.ec2.Instance(`${name}-web-server-${x}`, {
      ami: ami_id,
      instanceType: "t2.nano",
      subnetId:vpc_public_subnetids[x],
      vpcSecurityGroupIds: [mysecuritygroup.id],
      tags: { Name: `${name}-web-server-${x}` },
      userData:"#!/bin/bash\n" +
      "echo 'Hello, World!' > index.html\n" +
      "nohup python -m SimpleHTTPServer 80 &",
    });
    ips.push(myserver.publicIp)
    hostnames.push(myserver.publicDns)

    // Adding TargetGroupAttachment to servers.
    new awsx.lb.TargetGroupAttachment(`${name}-alb-target-group-${x}`, {
      instanceId: myserver.id,
      targetGroupArn: alb.defaultTargetGroup.arn,
    }, {dependsOn: alb})

  }

export const url_original = alb.loadBalancer.dnsName;
export const url = pulumi.interpolate`http://${alb.loadBalancer.dnsName}`;