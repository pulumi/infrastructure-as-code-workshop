# Lab 04 - Stack References

In this lab, we'll examine how stack references work, and how they can be used to pass outputs to other stacks.

## Step 1 - Export the values from `pulumi-docker`

In stack 1, modify your program to add an exported value:


```typescript
const config = new pulumi.Config();
const stack = pulumi.getStack();

const imageName = config.require('image_name');

const image = new docker.Image('local-image', {
    build: './app',
    imageName: `${imageName}:${stack}`,
    skipPush: true,
})

const container = new docker.Container('local-container', {
    image: image.baseImageName,
    ports: [{
        internal: 3000,
        external: 3000,
    }]
})

export const containerId = container.id
```

Run `pulumi up` to make sure the stack gets updated, and the value is exported.

## Step 2 - Create a second stack

In a new directory, create a second stack called `use-docker-id`

```bash
mkdir use-docker-id
cd use-docker-id
pulumi new typescript
```

Use the defaults, and ensure you use the `dev` stack.

## Step 3 - Configure your stack reference

Now we need to add a stack reference in use-docker-id


```typescript
import * as pulumi from "@pulumi/pulumi";

// set some config
const config = new pulumi.Config();

// get the current stack we're in as a reference
const stack = pulumi.getStack();

// get our current organization
const org = config.require("org");

// build the stack reference
const stackRef = new pulumi.StackReference(`${org}/pulumi-docker/${stack}`);

export const containerId = stackRef.getOutput('containerId');
```

Run `pulumi up`. You'll see the value gets exported from this stack now too.

These exported values are incredibly useful when using Pulumi stacks
