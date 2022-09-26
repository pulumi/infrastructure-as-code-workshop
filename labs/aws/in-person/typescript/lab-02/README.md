# Provisioning EC2 Virtual Machines

In this lab, you'll first create a single EC2 virtual machine (VM). Afterwards, you'll scale that out to a VM per availability 
zone in your region, and then add a load balancer to spread load across the entire fleet.

> This lab assumes you have a project set up and configured to use AWS. If you don't yet, please complete parts [1](../lab-01/01-creating-a-new-project.md) 
>and [2](../lab-01/02-configuring-aws.md) of lab-01.

## Step 1 &mdash;  Create the VPC and subnets.

Before we create the VM we need a vpc. We create a vpc with the [awsx](https://www.pulumi.com/registry/packages/awsx/) package.

Add the following awsx package to the `package.json` file:
```typescript
 "@pulumi/awsx": "^1.0.0-beta.10"
```

Now in your terminal run:
`npm update`

Next, we add the following code near the top of the `index.ts` file:
Add the following under the last `import` at the top of the file.

```typescript
import * as awsx from "@pulumi/awsx";
```

Next add the *name* variable below the last item in the `index.ts`

```typescript
// Variable we will use for naming purpose
const name = "demo";
```
We will use this throughout for naming purposes

Next add the vpc block below the **name**
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

Next we add outputs to view what we have created. These will be reference again later in the program.
```typescript
// VPC Outputs
export const vpc_id = myvpc.vpcId;
export const vpc_natgateways = myvpc.natGateways[0].id;
export const vpc_public_subnetids = myvpc.publicSubnetIds;
export const vpc_private_subnetids = myvpc.privateSubnetIds;
```

> :white_check_mark: After this change, your `index.ts` should [look like this](./code/03-provisioning-infrastructure/step1.ts).

Now deploy the changes:
```bash
pulumi up
```

View the outputs
```bash
pulumi stack output
```

Results
```
Current stack outputs (5):
    OUTPUT                 VALUE
    vpc_id                 vpc-0a42558d3b1ec37f3
    vpc_natgateways        nat-0a8ec79b65d13aeb6
    vpc_private_subnetids  ["subnet-07d2f9cff6e43c28e","subnet-05393e8a549e289ae","subnet-05eff8502af603d17"]
    vpc_public_subnetids   ["subnet-04cdf6ac58555b181","subnet-0ad17e2c8aa2f307f","subnet-035553db34c334ca5"]
```

## Step 2 &mdash;  Create the SecurityGroup in the VPC that we made.

Add the following awsx package to the `package.json` file:
```typescript
 "@pulumi/aws": "^5.0.0",
```

Import the AWS package at the top of the `index.ts` file:

```typescript
import * as aws from "@pulumi/aws";
```

Now in your terminal run:
`npm update`

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
          self: true,  // Add the securitygroup itself as a source. This will create another rule
        },
        { 
        protocol: "tcp", 
        fromPort: 80, 
        toPort: 80, 
        cidrBlocks: ["0.0.0.0/0"],
        description: "Allow inbound access via http" ,
        self: true, // Add the securitygroup itself as a source. This will create another rule
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

Update the outputs to validate that everything is correct.  Add the following code after the above code block.

```typescript
// Exporting security group outputs
export const security_group_name = mysecuritygroup.id;
export const security_group_vpc = mysecuritygroup.vpcId;
export const security_group_egress = mysecuritygroup.egress;
export const security_group_ingress = mysecuritygroup.ingress;
```

> :white_check_mark: After this change, your `index.ts` should [look like this](./code/03-provisioning-infrastructure/step2.ts).

Deploy the changes:
```bash
pulumi up
```

The important part is that the security group is created in our vpc and not in the `default` vpc. Wemust use securitygroup instead of securitygrouprules(otherwise, this securitygrouprules will create/delete on every update)

## Step 3 &mdash;  Get the AMI for the VM

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
> :white_check_mark: After this change, your `index.ts` should [look like this](./code/03-provisioning-infrastructure/step3.ts).

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

## Step 4 &mdash;  Create a virtual machine with our existing security group, vpc and subnet.

```typescript
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
```

Export the VM's resulting IP address and DNS

```typescript
export const ip = myserver.publicIp;
export const hostname = myserver.publicDns;
```

> For most real-world applications, you would want to create a dedicated image for your application, rather than embedding the script in your code like this.

> :white_check_mark: After this change, your `index.ts` should [look like this](./code/step4.ts).

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

## Step 5 – Create Multiple Virtual Machines
Now you will create multiple VM instances, each running the same Python webserver, across all the AWS availability zones in your VPC( one in each public subnet). 

We will create a new block of code that creates the webserver and exports the resulting IP address and hostname with the following.  We are keeping the old block so you can compare them:

```typescript
// Ec2 servers spread across each az(public in this case)
export const ips: any[] = [];
export const hostnames: any[] = [];

//for (let z = 0; z < 3; z++ ) // In case you want more number of servers per az
  for (let x = 0; x < 3; x++ ) {
    const myserver = new aws.ec2.Instance(`${name}-web-server-${x}`, {
      ami: ami_id,
      instanceType: "t2.nano",
      subnetId:vpc_public_subnetids[x],
      //subnetId: pulumi.interpolate`${vpc_public_subnetids[x]}`,
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

> :white_check_mark: After this change, your `index.ts` should [look like this](./code/step5.ts).

Now run a command to update your stack with the new resource definitions:

```bash
pulumi up
```

You will see 3 servers created.

```bash
    View Live: https://app.pulumi.com/shaht/my-iac-thursday-demo2/dev/updates/123

        Type                 Name                       Status      
        pulumi:pulumi:Stack  my-iac-thursday-demo2-dev              
    +   ├─ aws:ec2:Instance  demo-web-server-0          created     
    +   ├─ aws:ec2:Instance  demo-web-server-2          created     
    +   └─ aws:ec2:Instance  demo-web-server-1          created     
    
    Outputs:
        ami_id                : "ami-0f924dc71d44d23e2"
        hostname              : "ec2-3-137-167-209.us-east-2.compute.amazonaws.com"
    + hostnames             : [
    +     [0]: "ec2-3-131-38-241.us-east-2.compute.amazonaws.com"
    +     [1]: "ec2-3-143-142-252.us-east-2.compute.amazonaws.com"
    +     [2]: "ec2-52-15-196-240.us-east-2.compute.amazonaws.com"
        ]
        ip                    : "3.137.167.209"
    + ips                   : [
    +     [0]: "3.131.38.241"
    +     [1]: "3.143.142.252"
    +     [2]: "52.15.196.240"
        ]
```

To test the changes, curl any of the resulting IP addresses or hostnames:

```bash
for i in {0..2}; do curl $(pulumi stack output hostnames | jq -r ".[${i}]"); done
```

> The `pulumi stack output` command emits JSON serialized data &mdash; hence the use of the `jq` tool to extract a specific index. If you don't have `jq`, don't worry; simply copy-and-paste the hostname or IP address from the console output and `curl` that.

Note that the webserver number is included in its response:

```
Hello, World!
Hello, World!
Hello, World!
```

## Step 6 &mdash; Create a Load Balancer

Needing to loop over the webservers isn't very realistic. You will now create a load balancer over them to distribute load evenly.

Via the AWSX package, a collection of helpers that makes things like configuring load balancing easier:

Right after the security group creation, and before the new VM creation block, add the load balancer creation:

```typescript
...
// ALB via AWSX
const alb = new awsx.lb.ApplicationLoadBalancer(`${name}-alb-web-traffic`, {
  enableHttp2: true,
  subnetIds: [vpc_public_subnetids[0],vpc_public_subnetids[1],vpc_public_subnetids[2]],  // You have to pass in subnetsids otherwise this will get created in the default subnet.
  securityGroups: [ mysecuritygroup.id ],  
  listener: {port: 80},
});

//Export the load balancer
export const application_load_balancer_name = alb.loadBalancer.name;
...
```

In the **const myserver = new aws.ec2.Instance** block, add the following *TargetGroupAttachment* under
the **hostname.push(myserver.publicDns)** section

```typescript
...
..
    hostnames.push(server.publicDns);

    // Adding TargetGroupAttachment to servers.
    new awsx.lb.TargetGroupAttachment(`${name}-alb-target-group-${x}`, {
      instanceId: myserver.id,
      targetGroupArn: alb.defaultTargetGroup.arn,
    }, {dependsOn: alb})
}
```

Add the loadbalancer url to the end of the **index.ts*
Since we want to add `http` to the start of the url we have to use [Interpolation](https://www.pulumi.com/docs/intro/concepts/inputs-outputs/#outputs-and-strings) since it allows us to concatenate string outputs with other strings directly
without calling **apply**.

Add the following to the top of the `index.ts` file under the below the last import
```typescript
import * as pulumi from "@pulumi/pulumi";
```

Then at the bottom of the `index.ts` add the following 2 outputs.
```typescript
export const url_original = alb.loadBalancer.dnsName;
export const url = pulumi.interpolate`http://${alb.loadBalancer.dnsName}`;
```

> :white_check_mark: After this change, your `index.ts` should [look like this](./code/step6.ts).

Deploy these updates:

```bash
pulumi up
```

This should result in a fairly large update and, if all goes well, the load balancer's resulting endpoint URL:

```bash
    View Live: https://app.pulumi.com/shaht/my-iac-thursday-demo2/dev/updates/124

        Type                                Name                       Status       
        pulumi:pulumi:Stack                 my-iac-thursday-demo2-dev              
    +   ├─ awsx:lb:ApplicationLoadBalancer  demo-alb-web-traffic       created     
    +   │  ├─ aws:lb:TargetGroup            demo-alb-web-traffic       created     
    +   │  ├─ aws:lb:LoadBalancer           demo-alb-web-traffic       created     
    +   │  └─ aws:lb:Listener               demo-alb-web-traffic-0     created     
    +   ├─ awsx:lb:TargetGroupAttachment    demo-alb-target-group-1    created     
    +   │  └─ aws:lb:TargetGroupAttachment  demo-alb-target-group-1    created     
    +   ├─ awsx:lb:TargetGroupAttachment    demo-alb-target-group-0    created     
    +   │  └─ aws:lb:TargetGroupAttachment  demo-alb-target-group-0    created     
    +   └─ awsx:lb:TargetGroupAttachment    demo-alb-target-group-2    created     
    +      └─ aws:lb:TargetGroupAttachment  demo-alb-target-group-2    created     
    
    Outputs:
        ami_id                        : "ami-0f924dc71d44d23e2"
    + application_load_balancer_name: "demo-alb-web-traffic-24d3f66"
    + url                           : "http://demo-alb-web-traffic-24d3f66-1343030394.us-east-2.elb.amazonaws.com"
```

Now we can curl the load balancer:

```bash
for i in {0..10}; do curl $(pulumi stack output url); done
```

Observe that the resulting text changes based on where the request is routed:

```
Hello, World!
Hello, World!
Hello, World!
Hello, World!
Hello, World!
Hello, World!
Hello, World!
Hello, World!
Hello, World!
Hello, World!

```

## Step 7 &mdash; Destroy Everything

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
