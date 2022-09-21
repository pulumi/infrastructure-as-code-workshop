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