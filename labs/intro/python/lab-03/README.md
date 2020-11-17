# Stack References

In this lab, we'll examine how stack references work, and how they can be used to pass outputs to other stacks.

## Step 1 - Export the values from `stack-1`

In stack 1, modify your program to add an exported value:


```python
"""A Python Pulumi program"""

import pulumi

config = pulumi.Config()

required_value = config.require('required_value')
optional_value = config.get('optional_value')
secret_value = config.require_secret('secret_value')
exported_value = "i-am-exported"

print(required_value)
print(optional_value)
print(secret_value)

pulumi.export("exported_value", exported_value)
```

Run `pulumi up` to make sure the stack gets updated, and the value is exported.

## Step 2 - Create a second stack

In a new directory, create a second stack called `stack-2`

```bash
mkdir stack-2
pulumi new python
```

Use the defaults, and ensure you use the `dev` stack.

## Step 3 - Configure your stack reference

Now we need to add a stack reference in stack-2


```python
import pulumi

stack = pulumi.get_stack()

# get the Pulumi organization we're in
# FIXME: this needs to be set to your Pulumi login
org = 'my-org'

# get a stack reference
stack_ref = pulumi.StackReference(f"{org}/stack-1/{stack}")

# retrieve a value from that stack reference
exported_value_from_other_stack = stack_ref.get_output("exported_value")

pulumi.export("exported_value", exported_value_from_other_stack)
```

Run `pulumi up`. You'll see the value gets exported from this stack now too.

These exported values are incredibly useful when using Pulumi stacks

# Next Steps

* [Run a Docker Image](../lab-04/README.md)
