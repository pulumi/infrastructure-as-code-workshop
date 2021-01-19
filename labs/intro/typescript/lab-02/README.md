# Managing Configuration in Pulumi

Pulumi has optional and required configuration, so let's use both of these in our program.

## Step 1 - Create a new pulumi project

Create a new empty directory, and create a new pulumi project called `getting-started`

```bash
mkdir getting-started
cd getting-started
pulumi new typescript
```

Follow the prompts, and Use the default stack name `dev`

## Step 2 - Add some required configuration

In your `index.ts` add the following content

```typescript
import * as pulumi from "@pulumi/pulumi";

// create a new config object
const config = new pulumi.Config();

// required values must be set
const required_value = config.require("required_value")
```

Save and exit, and then run `pulumi up` on this project. You should receive an error:

```bash
error: Missing required configuration variable 'my-first-app:required_value'
        please set a value using the command `pulumi config set my-first-app:required_value <value>`
```

## Step 3 - Populate the configuration

Set the configuration option that is missing:

```bash
pulumi config set required_value "Hello, world!"
```

Re-run `pulumi up` and see that your pulumi program runs successfully, but there's no output.

## Step 4 - Add more configuration options

Now, populate your `index.ts` with two other configuration values and use the javascript `console.log` function to log their values

```typescript
import * as pulumi from "@pulumi/pulumi";

// create a new config object
const config = new pulumi.Config();

// optional values can be undefined
const optional_value = config.get("optional_value");

// required values must be set
const required_value = config.require("required_value");

// secret values get encrypted
const secret_value = config.requireSecret("secret_value");

console.log(optional_value)
console.log(required_value)
console.log(secret_value)
```

Set the required secret value using the `--secret` flag, like so:

```bash
pulumi config set secret_value "i-am-secret" --secret
```

Run `pulumi up` and examine the output

```bash
pulumi up
Previewing update (dev)

View Live: https://app.pulumi.com/jaxxstorm/getting-started/dev/previews/7ca6f282-c21f-49f3-a88d-bf6dcd1da608

     Type                 Name              Plan     Info
     pulumi:pulumi:Stack  getting-started-dev           12 messages
 
Diagnostics:
  pulumi:pulumi:Stack (getting-started-dev):
    undefined
    Hello, world!
    OutputImpl {
      __pulumiOutput: true,
      resources: [Function],
      allResources: [Function],
      isKnown: Promise { <pending> },
      isSecret: Promise { <pending> },
      promise: [Function],
      toString: [Function],
      toJSON: [Function]
    }
```

Note that the secret output is not in plaintext in the terminal

## Step 5 - Examine the stack config

In your Pulumi program directory, check the content of the `Pulumi.dev.yaml` file:

```yaml
config:
  getting-started:required_value: Hello, world!
  getting-started:secret_value:
    secure: AAABAKZdk4cT2RobMMGx2sbqwSZzaiXIp9j5UdLZUGT8zVA1Xc0wtJOjBQ==
```

## Step 6 - Create a new stack

Now, initialize a new stack using the `pulumi stack init` command:

```bash
pulumi stack init prod
```

check the available stacks:

```
pulumi stack ls
NAME   LAST UPDATE  RESOURCE COUNT  URL
dev    n/a          n/a             https://app.pulumi.com/jaxxstorm/getting-started/dev
prod*  n/a          n/a             https://app.pulumi.com/jaxxstorm/getting-started/prod
```

Notice the asterisk denoting the stack we're using.

Now, try and run that stack with `pulumi up`:

```bash
pulumi:pulumi:Stack (stack-1-prod):
    error: Missing required configuration variable 'getting-started:required_value'
        please set a value using the command `pulumi config set getting-started:message <value>`
    error: an unhandled error occurred: Program exited with non-zero exit code: 1
````

Our production stack does not have the configuration values. Configuration is stack dependent. We won't be using this stack, so let's delete it:

```
pulumi stack rm prod
```

and switch back to our `dev` stack:

```bash
pulumi stack select dev
```

# Next Steps

* [Resources](../lab-03/README.md)
