# Managing Configuration in Pulumi

Pulumi has optional and required configuration, so let's use both of these in our program.

## Step 1 - Create a new pulumi project

Create a new empty directory, and create a new pulumi project called `stack-1

```bash
mkdir stack-1
pulumi new python
```

Follow the prompts, and Use the default stack name `dev`

## Step 2 - Add some required configuration

In your `__main__.py` add the following content

```python
"""A Python Pulumi program"""

import pulumi

config = pulumi.Config()

required_value = config.require('required_value')
```

Save and exit, and then run `pulumi up` on this project. You should receive an error:

```bash
error: Missing required configuration variable 'stack-1:required_value'
        please set a value using the command `pulumi config set stack-1:required_value <value>`
    error: an unhandled error occurred: Program exited with non-zero exit code: 1
```

## Step 3 - Populate the configuration

Set the configuration option that is missing:

```bash
pulumi config set required_value = "i-am-required"
```

Re-run `pulumi up` and see that your pulumi program runs successfully, but there's no output.

## Step 4 - Add more configuration options

Now, populate your `__main__.py` with two other configuration values and use the python `print()` function to log their values

```
"""A Python Pulumi program"""

import pulumi

config = pulumi.Config()

required_value = config.require('required_value')
optional_value = config.get('optional_value')
secret_value = config.require_secret('secret_value')

print(required_value)
print(optional_value)
print(secret_value)
```

Set the required secret value using the `--secret` flag, like so:

```bash
pulumi config set secret_value "i-am-secret" --secret
```

Run `pulumi up` and examine the output

```bash
pulumi up 
Previewing update (dev)

View Live: https://app.pulumi.com/jaxxstorm/stack-1/dev/previews/8262ee83-26f9-4ae4-9378-3f415cf76227

     Type                 Name         Plan       Info
 +   pulumi:pulumi:Stack  stack-1-dev  create     3 messages

Diagnostics:
  pulumi:pulumi:Stack (stack-1-dev):
    i-am-required
    None
    <pulumi.output.Output object at 0x10db3fe80>
```

Note that the secret output is not in plaintext in the terminal

## Step 5 - Examine the stack config

In your Pulumi program directory, check the content of the `Pulumi.dev.yaml` file:

```yaml
config:
  stack-1:required_value: i-am-required
  stack-1:secret_value:
    secure: AAABAKFp4mnWwdZU4/j+wtcsGUeoIBUQQkzD+O/mYEYtcvNnh/YN1lNjxg==
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
dev    n/a          n/a             https://app.pulumi.com/jaxxstorm/stack-1/dev
prod*  n/a          n/a             https://app.pulumi.com/jaxxstorm/stack-1/prod
```

Notice the asterisk denoting the stack we're using.

Now, try and run that stack with `pulumi up`:

```bash
pulumi:pulumi:Stack (stack-1-prod):
    error: Missing required configuration variable 'stack-1:required_value'
        please set a value using the command `pulumi config set stack-1:required_value <value>`
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

* [Stack References](../lab-03/README.md)
