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

// Public Subnets
export const public_subnet1 = pulumi.interpolate`${vpc_public_subnetids[0]}`;
export const public_subnet2 = pulumi.interpolate`${vpc_public_subnetids[1]}`;
export const public_subnet3 = pulumi.interpolate`${vpc_public_subnetids[2]}`;

// Private Subnets
export const private_subnet1 = pulumi.interpolate`${vpc_private_subnetids[0]}`;
export const private_subnet2 = pulumi.interpolate`${vpc_private_subnetids[1]}`;
export const private_subnet3 = pulumi.interpolate`${vpc_private_subnetids[2]}`;

/* Comment out this block of code, replaced by multiple ec3 servers
const myserver = new aws.ec2.Instance(`${name}-web-server`, {
  ami: ami_id,
  instanceType: "t2.nano",
  subnetId: public_subnet1,
  vpcSecurityGroupIds: [mysecuritygroup.id],
  tags: { Name: `${name}-web-server` },
  userData:
    "#!/bin/bash\n" +
    "echo 'Hello, World!' > index.html\n" +
    "nohup python -m SimpleHTTPServer 80 &",
});

export const ip = myserver.publicIp;
export const hostname = myserver.publicDns;
*/

// Ec2 servers spread across each az(public in this case)
export const ips: any[] = [];
export const hostnames: any[] = [];

  for (let x = 0; x < 3; x++ ) {
    const myserver = new aws.ec2.Instance(`${name}-web-server-${x}`, {
      ami: ami_id,
      instanceType: "t2.nano",
      subnetId: pulumi.interpolate`${vpc_public_subnetids[x]}`,
      vpcSecurityGroupIds: [mysecuritygroup.id],
      tags: { Name: `${name}-web-server-${x}` },
      userData:
        "#!/bin/bash\n" +
        `echo 'Hello, World! -- from ${vpc_public_subnetids[x]}!' > index.html\n` +
        "nohup python -m SimpleHTTPServer 80 &",
    },{ dependsOn: mysecuritygroup });
    ips.push(myserver.publicIp)
    hostnames.push(myserver.publicDns)
  }