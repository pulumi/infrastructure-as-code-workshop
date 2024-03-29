import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";

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

// get Function for AMI
const myami = aws.ec2.getAmi({
  filters: [{ name: "name", values: ["amzn2-ami-k*-hvm-*-x86_64-gp2"] }],
  owners: [ "amazon" ],
  mostRecent: true,
});

// Exporting AMI_ID First Time
//export const ami_id = myami;

// Exporting AMI_ID with what we want.
export const ami_id = myami.then(ami=>ami.id);