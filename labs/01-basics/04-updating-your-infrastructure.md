# Updating Your Infrastructure

We just saw how to create new infrastructure from scratch. Next, let's make two updates:

* Add an object to your bucket.
* Enable server-side encryption on your bucket.

This demonstrates how declarative infrastrucutre as code tools can be used not just for initial provisioning, but also subsequent changes to existing resources.

## Step 1 &mdash; Add an Object to Your Bucket

Create a file `my-object.txt` and paste this into it:

```
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. In hac habitasse platea dictumst vestibulum rhoncus est pellentesque elit. Habitant morbi tristique senectus et netus et malesuada fames. Pellentesque dignissim enim sit amet venenatis urna cursus. Vitae nunc sed velit dignissim sodales.
```

Now add these lines to the end of your `index.ts` file:

```typescript
const myObject = new aws.s3.BucketObject("my-object.txt", {
    bucket: myBucket,
    source: "my-object.txt",
});
```

Deploy the changes:

```bash
pulumi up
```

This will give you a preview and selecting `yes` will apply the changes:

```
Updating (dev):

     Type                    Name              Status
     pulumi:pulumi:Stack     iac-workshop-dev
 +   └─ aws:s3:BucketObject  my-object         created

Resources:
    + 1 created
    2 unchanged

Duration: 4s

Permalink: https://app.pulumi.com/joeduffy/iac-workshop/dev/updates/3
```

A single resource is added and the 2 existing resources are left unchanged. This is a key attribute of infrastructure as code &mdash; such tools determine the minimal set of changes necessary to update your infrastructure from one change to the next.

Finally, relist the contents of your bucket:

```bash
aws s3 ls $(pulumi stack output bucketName)
```

Notice that your `my-object.txt` file has been added:

```
2019-10-22 16:50:54        362 my-object.txt
```

## Step 1 &mdash; Enable Server-Side Encryption

To enable encryption on your bucket, first allocate a new KMS Key. Add this line to your `index.ts` file _after_ the `import ...` lines but _before_ you create the `aws.s3.Bucket` object (since the bucket must reference it):

```typescript
...
const myKey = new aws.kms.Key("my-key");
...
```

Next, replace the single line that allocates your bucket with the following:

```typescript
...
const myBucket = new aws.s3.Bucket("my-bucket", {
    serverSideEncryptionConfiguration: {
        rule: {
            applyServerSideEncryptionByDefault: {
                sseAlgorithm: "aws:kms",
                kmsMasterKeyId: myKey.id,
            },
        },
    },
});
...
```

For reference, your full `index.ts` should now look like this:

```
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const myKey = new aws.kms.Key("my-key");

const myBucket = new aws.s3.Bucket("my-bucket", {
    serverSideEncryptionConfiguration: {
        rule: {
            applyServerSideEncryptionByDefault: {
                sseAlgorithm: "aws:kms",
                kmsMasterKeyId: myKey.id,
            },
        },
    },
});
export const bucketName = myBucket.bucket;

const myObject = new aws.s3.BucketObject("my-object", {
    bucket: myBucket,
    source: "my-object.txt",
});
```

Now deploy the changes:

```bash
pulumi up
```

This shows a preview like so:

```
Previewing update (dev):

     Type                 Name              Plan       Info
     pulumi:pulumi:Stack  iac-workshop-dev
 +   ├─ aws:kms:Key       my-key            create
 ~   └─ aws:s3:Bucket     my-bucket         update     [diff: +serverSideEncryptionConfiguration]

Outputs:
  ~ bucketName: "my-bucket-8257ac5" => output<string>

Resources:
    + 1 to create
    ~ 1 to update
    2 changes. 2 unchanged

Do you want to perform this update?
  yes
> no
  details
```

Selecting `details` during the preview is more interesting this time:

```
  pulumi:pulumi:Stack: (same)
    [urn=urn:pulumi:dev::iac-workshop::pulumi:pulumi:Stack::iac-workshop-dev]
    + aws:kms/key:Key: (create)
        [urn=urn:pulumi:dev::iac-workshop::aws:kms/key:Key::my-key]
        [provider=urn:pulumi:dev::iac-workshop::pulumi:providers:aws::default_1_7_0::f3d84ff8-7786-4bd8-9de5-9d74ade69bdb]
        enableKeyRotation: false
        isEnabled        : true
    ~ aws:s3/bucket:Bucket: (update)
        [id=my-bucket-8257ac5]
        [urn=urn:pulumi:dev::iac-workshop::aws:s3/bucket:Bucket::my-bucket]
        [provider=urn:pulumi:dev::iac-workshop::pulumi:providers:aws::default_1_7_0::f3d84ff8-7786-4bd8-9de5-9d74ade69bdb]
      + serverSideEncryptionConfiguration: {
          + rule      : {
              + applyServerSideEncryptionByDefault: {
                  + kmsMasterKeyId: output<string>
                  + sseAlgorithm  : "aws:kms"
                }
            }
        }
    --outputs:--
  ~ bucketName: "my-bucket-8257ac5" => output<string>

Do you want to perform this update?
  yes
> no
  details
```

Afterwards, select `yes` to deploy all of the updates:

```
Updating (dev):

     Type                 Name              Status      Info
     pulumi:pulumi:Stack  iac-workshop-dev
 +   ├─ aws:kms:Key       my-key            created
 ~   └─ aws:s3:Bucket     my-bucket         updated     [diff: +serverSideEncryptionConfiguration]

Outputs:
    bucketName: "my-bucket-8257ac5"

Resources:
    + 1 created
    ~ 1 updated
    2 changes. 2 unchanged

Duration: 7s

Permalink: https://app.pulumi.com/joeduffy/iac-workshop/dev/updates/4
```

## Next Steps

* [Making Your Stack Configurable](./05-making-your-stack-configurable.md)
