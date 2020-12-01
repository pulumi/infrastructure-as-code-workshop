# Stack References

In this lab, we'll examine how stack references work, and how they can be used to pass outputs to other stacks.

## Step 1 - Export the values from `stack-1`

In stack 1, modify your program to add an exported value:


```typescript
import * as pulumi from "@pulumi/pulumi";

// create a new config object
const config = new pulumi.Config();

// optional values can be undefined
const optional_value = config.get("optional_value");

// this is now an exported value
export const required_value = config.require("required_value");

// secret values get encrypted
const secret_value = config.requireSecret("secret_value");
```

Run `pulumi up` to make sure the stack gets updated, and the value is exported.

## Step 2 - Create a second stack

In a new directory, create a second stack called `stack-2`

```bash
mkdir stack-2
pulumi new typescript
```

Use the defaults, and ensure you use the `dev` stack.

## Step 3 - Configure your stack reference

Now we need to add a stack reference in stack-2


```typescript
import * as pulumi from "@pulumi/pulumi";

// set some config
const config = new pulumi.Config();

// get the current stack we're in as a reference
const stack = pulumi.getStack();

// get our current organization
const org = config.require("org");

// build the stack reference
const stackRef = new pulumi.StackReference(`${org}/stack-1/${stack}`);

export const required_value = stackRef.getOutput('required_value');
```

Run `pulumi up`. You'll see the value gets exported from this stack now too.

These exported values are incredibly useful when using Pulumi stacks

# Next Steps

* [Run a Docker Image](../lab-04/README.md)
