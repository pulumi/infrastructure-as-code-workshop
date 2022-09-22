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
    natGateways: {
      strategy: "Single", // This is mainly to save cost. You do this only in dev
    },
  });

// VPC Outputs
export const vpc_id = myvpc.vpcId;
export const vpc_natgateways = myvpc.natGateways[0].id;
export const vpc_public_subnetids = myvpc.publicSubnetIds;
export const vpc_private_subnetids = myvpc.privateSubnetIds;

const mysecuritygroup = new aws.ec2.SecurityGroup(`${name}-securitygroup`, {
    vpcId:myvpc.vpcId,
    ingress: [
        { protocol: "tcp", 
          fromPort: 443, 
          toPort: 443, 
          cidrBlocks: ["0.0.0.0/0"],
          description: "Allow inbound access via https" 
        },
        { 
        protocol: "tcp", 
        fromPort: 80, 
        toPort: 80, 
        cidrBlocks: ["0.0.0.0/0"],
        description: "Allow inbound access via http" 
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

export const security_group_name = mysecuritygroup.id;
export const security_group_vpc = mysecuritygroup.vpcId;
export const security_group_egress = mysecuritygroup.egress;
export const security_group_ingress = mysecuritygroup.ingress;

export const subnet_for_server = pulumi.interpolate`${vpc_public_subnetids[0]}`;

const myserver = new aws.ec2.Instance(`${name}-web-server`, {
  ami: ami_id,
  instanceType: "t2.nano",
  subnetId: subnet_for_server,
  vpcSecurityGroupIds: [mysecuritygroup.id],
  tags: { Name: `${name}-web-server` },
  userData:
    "#!/bin/bash\n" +
    "echo 'Hello, World!' > index.html\n" +
    "nohup python -m SimpleHTTPServer 80 &",
});

export const ip = myserver.publicIp;
export const hostname = myserver.tags.apply(myname=>myname);