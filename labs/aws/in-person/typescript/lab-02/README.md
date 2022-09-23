# Provisioning EC2 Virtual Machines

In this lab, you'll first create a single EC2 virtual machine (VM). Afterwards, you'll scale that out to a VM per availability 
zone in your region, and then add a load balancer to spread load across the entire fleet.

> This lab assumes you have a project set up and configured to use AWS. If you don't yet, please complete parts [1](../lab-01/01-creating-a-new-project.md) 
>and [2](../lab-01/02-configuring-aws.md) of lab-01.

## Step 1 &mdash;  Get the AMI for the VM

Import the AWS package in an empty `index.ts` file:

```typescript
import * as aws from "@pulumi/aws";
```

Now dynamically query the Amazon Linux machine image. Doing this in code avoids needing to hard-code the machine image (a.k.a., its AMI):

```typescript
const myami = aws.ec2.getAmi({
    filters: [{ name: "name", values: ["amzn2-ami-k*-hvm-*-x86_64-gp2"] }],
    owners: [ "amazon" ],
    mostRecent: true,
}).then(ami => ami.id);
```
Next, we want to export the ami to see what it is

```typescript
export const ami_id = myami;
```

> :white_check_mark: After this change, your `index.ts` should [look like this](./code/03-provisioning-infrastructure/step1.ts).

Now deploy the changes:
```bash
pulumi up
```

Notice that the Output `ami_id` contains more information than we want. We only need the *id*
```
View Live: https://app.pulumi.com/myuser/my-iac-demo2/dev/previews/a707d964-adce-43f4-8e98-a1b36d45dabc

     Type                 Name              Plan       
 +   pulumi:pulumi:Stack  my-iac-demo2-dev  create     
 
Outputs:
    ami_id: {
        architecture       : "x86_64"
        arn                : "arn:aws:ec2:us-east-2::image/ami-0568773882d492fc8"
        blockDeviceMappings: [
            [0]: {
                deviceName : "/dev/xvda"
                ebs        : {
                    delete_on_termination: "true"
                    encrypted            : "false"
                    iops                 : "0"
                    snapshot_id          : "snap-0eb18291b5565e22a"
                    throughput           : "0"
                    volume_size          : "8"
                    volume_type          : "gp2"
                }
            }
        ]
        creationDate       : "2022-08-17T23:46:15.000Z"
        deprecationTime    : "2024-08-17T23:46:15.000Z"
        description        : "Amazon Linux 2 Kernel 5.10 AMI 2.0.20220805.0 x86_64 HVM gp2"
        enaSupport         : true
        filters            : [
            [0]: {
                name  : "name"
                values: [
                    [0]: "amzn2-ami-k*-hvm-*-x86_64-gp2"
                ]
            }
        ]
        hypervisor         : "xen"
        id                 : "ami-0568773882d492fc8"
        imageId            : "ami-0568773882d492fc8"
        imageLocation      : "amazon/amzn2-ami-kernel-5.10-hvm-2.0.20220805.0-x86_64-gp2"
        imageOwnerAlias    : "amazon"
        imageType          : "machine"
        includeDeprecated  : false
        mostRecent         : true
        name               : "amzn2-ami-kernel-5.10-hvm-2.0.20220805.0-x86_64-gp2"
        ownerId            : "137112412989"
        owners             : [
            [0]: "amazon"
        ]
        platformDetails    : "Linux/UNIX"
        public             : true
        rootDeviceName     : "/dev/xvda"
        rootDeviceType     : "ebs"
        rootSnapshotId     : "snap-0eb18291b5565e22a"
        sriovNetSupport    : "simple"
        state              : "available"
        stateReason        : {
            code   : "UNSET"
            message: "UNSET"
        }
        usageOperation     : "RunInstances"
        virtualizationType : "hvm"
    }

Resources:
    + 1 to create
```

Say `NO` and let us update the output.
Append the following to the end of the export ami_id
`.then(ami=>ami.id)`
so that it now looks like the following:
```typescript
export const ami_id = myami.then(ami=>ami.id);
```
> :white_check_mark: After this change, your `index.ts` should [look like this](./code/03-provisioning-infrastructure/step1_5.ts).

Now deploy the changes:
```bash
pulumi up
```

```
     Type                 Name              Status      
 +   pulumi:pulumi:Stack  my-iac-demo2-dev  created     
 
Outputs:
    ami_id: "ami-0568773882d492fc8"

Resources:
    + 1 create

```
Notice that the Output  `ami_id` has exactly what we want: the **ami_id**. Make sure to select **yes** this time.

## Step 2 &mdash;  Create the VPC and subnets.

Before we create the VM we need a vpc. We create a vpc with the [awsx](https://www.pulumi.com/registry/packages/awsx/) package.

Append the following awsx package to the `package.json` file:
```typescript
 "@pulumi/awsx": "^1.0.0-beta.10"
```

Now in your terminal run:
`npm update`

Next we will add the following code near the top of the `index.ts` file:
Add the following under the last `import` at the top of the file.

```typescript
import * as awsx from "@pulumi/awsx";
```

Next add the name prefix below the last item in the `index.ts`

```typescript
// Variable we will use for naming purpose
const name = "demo";
```
We will use this throughout for naming purposes

Next add the vpc block below the name
```typescript
// Creating a VPC with a Single Nat Gateway  Strategy (To save cost)
const myvpc = new awsx.ec2.Vpc(`${name}-vpc`, {
  cidrBlock: "10.0.0.0/24",
  numberOfAvailabilityZones: 3,
  enableDnsHostnames: true,
  natGateways: {
    strategy: "Single", # This is mainly to save cost on nat. You do this only in dev
  },
});
```

Next we are going to add outputs since we want to know what gets created to use later.
```typescript
// VPC Outputs
export const vpc_id = myvpc.vpcId;
export const vpc_natgateways = myvpc.natGateways[0].id;
export const vpc_public_subnetids = myvpc.publicSubnetIds;
export const vpc_private_subnetids = myvpc.privateSubnetIds;
```

> :white_check_mark: After this change, your `index.ts` should [look like this](./code/03-provisioning-infrastructure/step2.ts).

Now deploy the changes:
```bash
pulumi up
```

Let's view the outputs
```bash
pulumi stack output
```

Results
```
Current stack outputs (5):
    OUTPUT                 VALUE
    ami_id                 ami-0c2ab3b8efb09f272
    vpc_id                 vpc-0a42558d3b1ec37f3
    vpc_natgateways        nat-0a8ec79b65d13aeb6
    vpc_private_subnetids  ["subnet-07d2f9cff6e43c28e","subnet-05393e8a549e289ae","subnet-05eff8502af603d17"]
    vpc_public_subnetids   ["subnet-04cdf6ac58555b181","subnet-0ad17e2c8aa2f307f","subnet-035553db34c334ca5"]
```

## Step 3 &mdash;  Create the SecurityGroup in the VPC that we made.

Add the following code block below the vpc outputs in the `index.ts`.

```typescript
const mysecuritygroup = new aws.ec2.SecurityGroup(`${name}-securitygroup`, {
    vpcId:myvpc.vpcId,
    ingress: [
        { protocol: "tcp", 
          fromPort: 443, 
          toPort: 443, 
          cidrBlocks: ["0.0.0.0/0"],
          description: "Allow inbound access via https",
          self: true,  // Add the securitygroup itself as a source
        },
        { 
        protocol: "tcp", 
        fromPort: 80, 
        toPort: 80, 
        cidrBlocks: ["0.0.0.0/0"],
        description: "Allow inbound access via http" ,
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
```

We also want to update the outputs to validate that we are creating everything in the right place. Add the following below the code block above.

```typescript
// Exporting security group outputs
export const security_group_name = mysecuritygroup.id;
export const security_group_vpc = mysecuritygroup.vpcId;
export const security_group_egress = mysecuritygroup.egress;
export const security_group_ingress = mysecuritygroup.ingress;
```

> :white_check_mark: After this change, your `index.ts` should [look like this](./code/03-provisioning-infrastructure/step3.ts).

Now deploy the changes:
```bash
pulumi up
```

The key part is to make sure that the security group is created in the vpc. Also, we
you must use securitygroup instead of securitygrouprules(otherwise, this will create/delete on every update)

## Step 4 &mdash;  Figure out the Subnets via Interpolation

The vm will need a subnet to place this in.  We need to use [Interpolation](https://www.pulumi.com/docs/intro/concepts/inputs-outputs/#outputs-and-strings)
Interpolation allows us to concatenate string outputs with other strings directly to figure it out.

Place the following block of code below the *security_group_ingress* outputs

Add the following line to the very top of the **index.ts** file.
```typescript
import * as pulumi from "@pulumi/pulumi";
```

Next add the following to the very bottom of the **index.ts** file.
Note: the **even** subnets are public, **odd** ones are private.
```typescript
// Public Subnets
export const public_subnet1 = pulumi.interpolate`${vpc_public_subnetids[0]}`;
export const public_subnet2 = pulumi.interpolate`${vpc_public_subnetids[1]}`;
export const public_subnet3 = pulumi.interpolate`${vpc_public_subnetids[2]}`;

// Private Subnets
export const private_subnet1 = pulumi.interpolate`${vpc_private_subnetids[0]}`;
export const private_subnet2 = pulumi.interpolate`${vpc_private_subnetids[1]}`;
export const private_subnet3 = pulumi.interpolate`${vpc_private_subnetids[2]}`;
```
We are exporting it so we can see the value in it. No new resources are created, only  additional outputs are added

Now deploy the changes:
```bash
pulumi up
```
## Step 5 &mdash;  Create a virtual machine with the security group above in the vpc and subnet we create.

```typescript
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
```

Finally export the VM's resulting IP address and instance_id

```typescript
export const ip = myserver.publicIp;
export const hostname = myserver.publicDns;
```

> For most real-world applications, you would want to create a dedicated image for your application, rather than embedding the script in your code like this.

> :white_check_mark: After this change, your `index.ts` should [look like this](./code/step5.ts).

Now deploy the changes:
```bash
pulumi up
```

```
View Live: https://app.pulumi.com/myuser/my-iac-thursday-demo2/dev/updates/56

     Type                 Name                       Status      
     pulumi:pulumi:Stack  my-iac-thursday-demo2-dev              
 +   └─ aws:ec2:Instance  demo-web-server            created     
 
Outputs:
  + hostname              : "ec2-3-139-83-244.us-east-2.compute.amazonaws.com"
  + ip                    : "3.139.83.244"

Resources:
    + 1 created
    31 unchanged

Duration: 46s
```

To verify that our server is accepting requests properly, curl either the hostname or IP address:

```bash
curl $(pulumi stack output hostname)
```

Either way you should see a response from the Python webserver:

```
Hello, World!
```

## Step 6 – Create Multiple Virtual Machines
Now you will create multiple VM instances, each running the same Python webserver, across all the AWS availability zones in your VPC. 


Replace the part of your code that creates the webserver and exports the resulting IP address and hostname with the following:

```typescript
...
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
```

> :white_check_mark: After this change, your `index.ts` should [look like this](./code/step6.ts).

Now run a command to update your stack with the new resource definitions:

```bash
pulumi up
```

You will see 3 servers created and 1 server deleted.  Note that **create** happens before **delete**:

```
View Live: https://app.pulumi.com/shaht/my-iac-thursday-demo2/dev/updates/66

     Type                 Name                       Status      
     pulumi:pulumi:Stack  my-iac-thursday-demo2-dev              
 +   ├─ aws:ec2:Instance  demo-web-server-2          created     
 +   ├─ aws:ec2:Instance  demo-web-server-1          created     
 +   ├─ aws:ec2:Instance  demo-web-server-0          created     
 -   └─ aws:ec2:Instance  demo-web-server            deleted     

Outputs:
  - hostname              : "ec2-3-143-235-154.us-east-2.compute.amazonaws.com"
  + hostnames             : [
  +     [0]: "ec2-3-144-90-22.us-east-2.compute.amazonaws.com"
  +     [1]: "ec2-18-117-125-29.us-east-2.compute.amazonaws.com"
  +     [2]: "ec2-3-16-151-71.us-east-2.compute.amazonaws.com"
    ]
  - ip                    : "3.143.235.154"
  + ips                   : [
  +     [0]: "3.144.90.22"
  +     [1]: "18.117.125.29"
  +     [2]: "3.16.151.71"
    ]

Resources:
    + 3 created
    - 1 deleted
    4 changes. 31 unchanged

Duration: 1m17s

View Live: https://app.pulumi.com/shaht/my-iac-thursday-demo2/dev/updates/66
```

Notice that your original server was deleted and new ones created in its place, because its name changed.

To test the changes, curl any of the resulting IP addresses or hostnames:

```bash
for i in {0..2}; do curl $(pulumi stack output hostnames | jq -r ".[${i}]"); done
```

> The `pulumi stack output` command emits JSON serialized data &mdash; hence the use of the `jq` tool to extract a specific index. If you don't have `jq`, don't worry; simply copy-and-paste the hostname or IP address from the console output and `curl` that.

Note that the webserver number is included in its response:

```
Hello, World -- from eu-central-1a!
Hello, World -- from eu-central-1b!
Hello, World -- from eu-central-1c!
```

## Step 7 &mdash; Create a Load Balancer

Needing to loop over the webservers isn't very realistic. You will now create a load balancer over them to distribute load evenly.

Now via the AWSX package, a collection of helpers that makes things like configuring load balancing easier:

Delete the port 80 `ingress` rule from your security group, leaving behind only the ICMP rule:

```typescript
...
const sg = new aws.ec2.SecurityGroup("web-secgrp", {
    ingress: [
        { protocol: "icmp", fromPort: 8, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
    ],
});
...
```

This is required to ensure the security group ingress rules don't conflict with the load balancer's.

Now right after the security group creation, and before the VM creation block, add the load balancer creation:

```typescript
...
// Create alb
const alb = new awsx.lb.ApplicationLoadBalancer("web-traffic", {
    external: true,
    securityGroups: [ sg.id ],
});
const listener = alb.createListener("web-listener", { port: 80 });
...
```

And then replace the VM creation block with the following:

```typescript
...
export const ips: any[] = [];
export const hostnames: any[] = [];
for (const az of aws.getAvailabilityZones().names) {
    const server = new aws.ec2.Instance(`web-server-${az}`, {
        instanceType: "t2.micro",
        securityGroups: [ sg.name ],
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
```

> :white_check_mark: After this change, your `index.ts` should [look like this](./code/step4.ts).

Deploy these updates:

```bash
pulumi up
```

This should result in a fairly large update and, if all goes well, the load balancer's resulting endpoint URL:

```
Updating (dev):

     Type                                          Name                             Status      Info
     pulumi:pulumi:Stack                           iac-workshop-dev
 ~   ├─ aws:ec2:SecurityGroup                      web-secgrp                       updated     [diff: ~ingress]
 +   ├─ awsx:x:ec2:Vpc                             default-vpc-eb926d81             created
 +   │  ├─ awsx:x:ec2:Subnet                       default-vpc-eb926d81-public-0    created
 +   │  └─ awsx:x:ec2:Subnet                       default-vpc-eb926d81-public-1    created
 +   └─ aws:lb:ApplicationLoadBalancer             web-traffic                      created
 +      ├─ awsx:lb:ApplicationTargetGroup          web-listener                     created
 +      │  ├─ awsx:lb:TargetGroupAttachment        web-target-eu-central-1a         created
 +      │  │  └─ aws:lb:TargetGroupAttachment      web-target-eu-central-1a         created
 +      │  ├─ awsx:lb:TargetGroupAttachment        web-target-eu-central-1b         created
 +      │  │  └─ aws:lb:TargetGroupAttachment      web-target-eu-central-1b         created
 +      │  ├─ awsx:lb:TargetGroupAttachment        web-target-eu-central-1c         created
 +      │  │  └─ aws:lb:TargetGroupAttachment      web-target-eu-central-1c         created
 +      │  └─ aws:lb:TargetGroup                   web-listener                     created
 +      ├─ awsx:x:ec2:SecurityGroup                web-traffic-0                    created
 +      ├─ awsx:lb:ApplicationListener             web-listener                     created
 +      │  ├─ awsx:x:ec2:IngressSecurityGroupRule  web-listener-external-0-ingress  created
 +      │  │  └─ aws:ec2:SecurityGroupRule         web-listener-external-0-ingress  created
 +      │  ├─ awsx:x:ec2:EgressSecurityGroupRule   web-listener-external-0-egress   created
 +      │  │  └─ aws:ec2:SecurityGroupRule         web-listener-external-0-egress   created
 +      │  └─ aws:lb:Listener                      web-listener                     created
 +      └─ aws:lb:LoadBalancer                     web-traffic                      created

Outputs:
    hostnames: [
        [0]: "ec2-18-197-184-46.eu-central-1.compute.amazonaws.com"
        [1]: "ec2-18-196-225-191.eu-central-1.compute.amazonaws.com"
        [2]: "ec2-35-158-83-62.eu-central-1.compute.amazonaws.com"
    ]
    ips      : [
        [0]: "18.197.184.46"
        [1]: "18.196.225.191"
        [2]: "35.158.83.62"
  + url      : "web-traffic-09348bc-723263075.eu-central-1.elb.amazonaws.com"

Resources:
    + 20 created
    ~ 1 updated
    21 changes. 4 unchanged

Duration: 2m33s

Permalink: https://app.pulumi.com/joeduffy/iac-workshop/dev/updates/3
```

Now we can curl the load balancer:

```bash
for i in {0..10}; do curl $(pulumi stack output url); done
```

Observe that the resulting text changes based on where the request is routed:

```
Hello, World -- from eu-central-1b!
Hello, World -- from eu-central-1c!
Hello, World -- from eu-central-1a!
Hello, World -- from eu-central-1b!
Hello, World -- from eu-central-1b!
Hello, World -- from eu-central-1a!
Hello, World -- from eu-central-1c!
Hello, World -- from eu-central-1a!
Hello, World -- from eu-central-1c!
Hello, World -- from eu-central-1b!
```

## Step 5 &mdash; Destroy Everything

Finally, destroy the resources and the stack itself:

```
pulumi destroy
pulumi stack rm
```

## Next Steps

Congratulations! :tada: You have stood up an EC2 VM, scaled it out across multiple availability zones, and configured a
load balancer to spread traffic across all of your instances.

Next, choose amongst these labs:

* [Deploying Containers to Elastic Container Service (ECS) "Fargate"](../lab-03/README.md)
* [Deploying Containers to a Kubernetes Cluster](../lab-04/README.md)
* [Using AWS Lambda for Serverless Application Patterns](../lab-05/README.md)

Or view the [suggested next steps](../../../../README.md#next-steps) after completing all labs.
