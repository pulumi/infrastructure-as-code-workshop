import * as aws from "@pulumi/aws";

// get Function for AMI
const myami = aws.ec2.getAmi({
    filters: [{ name: "name", values: ["amzn2-ami-k*-hvm-*-x86_64-gp2"] }],
    owners: [ "amazon" ],
    mostRecent: true,
});

// Exporting AMI_ID
export const ami_id = myami.then(ami=>ami.id);