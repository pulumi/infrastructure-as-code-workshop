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

```



